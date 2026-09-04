import { createRef } from "react";
import { useForm } from "react-hook-form";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileFormatIcon, UploadField } from "./UploadField";

function createFile(name: string, type: string, size = 1024) {
  return new File([new ArrayBuffer(size)], name, { type });
}

function setFileInput(files: File[]) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, "files", {
    value: files as unknown as FileList,
    configurable: true,
  });
  fireEvent.change(input);
}

describe("UploadField", () => {
  it("renders dropzone with title and subtitle", () => {
    render(<UploadField accept=".csv" maxSize={10 * 1024 * 1024} />);
    expect(screen.getByText("Click to upload or drag and drop")).toBeInTheDocument();
    expect(screen.getByText("Only CSV files are supported. Maximum filesize 10MB.")).toBeInTheDocument();
  });

  it("names every accepted format, not just the first match", () => {
    render(<UploadField accept=".pdf,.jpg,.jpeg" />);
    expect(screen.getByText("Only PDF and JPG files are supported.")).toBeInTheDocument();
  });

  it("names formats the old chain did not know about", () => {
    render(<UploadField accept=".png,.jpg" />);
    expect(screen.getByText("Only PNG and JPG files are supported.")).toBeInTheDocument();
  });

  it("lists three or more formats with a serial comma", () => {
    render(<UploadField accept=".png,.jpeg,.pdf" />);
    expect(screen.getByText("Only PNG, JPG and PDF files are supported.")).toBeInTheDocument();
  });

  it("reads a wildcard MIME group alongside an extension", () => {
    render(<UploadField accept="image/*,.pdf" />);
    expect(screen.getByText("Only image and PDF files are supported.")).toBeInTheDocument();
  });

  it("names the formats in the spreadsheet accept string", () => {
    // The exact string UploadStep passes. It supplies its own "Spreadsheet
    // files" wording via `subtitle`, so the derived text stays generic here.
    render(
      <UploadField accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" />,
    );
    expect(screen.getByText("Only Excel and CSV files are supported.")).toBeInTheDocument();
  });

  it("treats an explicit null subtitle as a request to hide it", () => {
    render(<UploadField accept=".pdf" subtitle={null} />);
    expect(document.querySelector(".clet-upload-field__subtitle")).toBeNull();
  });

  it("drops the support sentence when nothing is accepted", () => {
    render(<UploadField />);
    expect(screen.queryByText(/are supported/)).not.toBeInTheDocument();
    expect(document.querySelector(".clet-upload-field__subtitle")).toBeNull();
  });

  it("keeps the size sentence when only maxSize is set", () => {
    render(<UploadField maxSize={5 * 1024 * 1024} />);
    expect(screen.getByText("Maximum filesize 5MB.")).toBeInTheDocument();
  });

  it("lets the consumer write the subtitle", () => {
    render(<UploadField accept=".pdf" subtitle="Attach the signed evidence" />);
    expect(screen.getByText("Attach the signed evidence")).toBeInTheDocument();
    expect(screen.queryByText(/are supported/)).not.toBeInTheDocument();
  });

  it("hides the subtitle when passed an empty string", () => {
    render(<UploadField accept=".pdf" subtitle="" />);
    expect(document.querySelector(".clet-upload-field__subtitle")).toBeNull();
  });

  it("does not leak subtitle onto the DOM node", () => {
    render(<UploadField accept=".pdf" subtitle="Custom hint" />);
    expect(document.querySelector(".clet-upload-field")).not.toHaveAttribute("subtitle");
  });

  it("renders upload button", () => {
    render(<UploadField />);
    expect(document.querySelector(".clet-upload-field__action")).toHaveTextContent("Upload file");
  });

  it("renders cloud upload icon", () => {
    render(<UploadField />);
    expect(document.querySelector(".clet-upload-field__icon .lucide-cloud-upload")).toBeInTheDocument();
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<UploadField ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies invalid styling and aria-invalid", () => {
    render(<UploadField invalid />);
    expect(document.querySelector(".clet-upload-field--invalid")).toBeInTheDocument();
    expect(document.querySelector(".clet-upload-field")).toHaveAttribute("aria-invalid", "true");
  });

  it("respects aria-invalid over invalid prop", () => {
    render(<UploadField invalid={false} aria-invalid="true" />);
    expect(document.querySelector(".clet-upload-field--invalid")).toBeInTheDocument();
  });

  it("applies disabled styling and class", () => {
    render(<UploadField disabled />);
    expect(document.querySelector(".clet-upload-field--disabled")).toBeInTheDocument();
  });

  it("forwards aria-describedby", () => {
    render(<UploadField aria-describedby="desc-id" />);
    expect(document.querySelector(".clet-upload-field")).toHaveAttribute("aria-describedby", "desc-id");
  });

  it("merges classNames onto parts", () => {
    render(
      <UploadField
        className="custom-classname"
        classNames={{
          root: "custom-root",
          removeButton: "custom-remove",
        }}
      />,
    );
    expect(document.querySelector(".clet-upload-field")).toHaveClass("custom-root");
    expect(document.querySelector(".clet-upload-field")).toHaveClass("custom-classname");
  });

  it("triggers onChange with single file on selection", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("photo.jpg", "image/jpeg")]);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("shows file card after selection", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("report.pdf", "application/pdf", 204800)]);

    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("200 KB")).toBeInTheDocument();
  });

  it("shows replace button when file is selected", () => {
    render(<UploadField />);
    setFileInput([createFile("doc.txt", "text/plain")]);
    expect(screen.getByRole("button", { name: "Replace file" })).toBeInTheDocument();
  });

  it("removes file and shows upload button on delete", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("doc.txt", "text/plain")]);

    const removeButton = screen.getByRole("button", { name: /^Remove /i });
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(document.querySelector(".clet-upload-field__action")).toHaveTextContent("Upload file");
  });

  it("does not show remove button when disabled", () => {
    render(<UploadField disabled />);
    setFileInput([createFile("doc.txt", "text/plain")]);
    expect(screen.queryByRole("button", { name: /^Remove /i })).not.toBeInTheDocument();
  });

  it("applies drag-over class when dragging over dropzone", () => {
    render(<UploadField />);
    const dropzone = document.querySelector(".clet-upload-field")!;
    fireEvent.dragOver(dropzone, { bubbles: true });
    expect(document.querySelector(".clet-upload-field--drag-over")).toBeInTheDocument();
  });

  it("removes drag-over class on drag leave", () => {
    render(<UploadField />);
    const dropzone = document.querySelector(".clet-upload-field")!;
    fireEvent.dragOver(dropzone, { bubbles: true });
    expect(document.querySelector(".clet-upload-field--drag-over")).toBeInTheDocument();
    fireEvent.dragLeave(dropzone, { bubbles: true });
    expect(document.querySelector(".clet-upload-field--drag-over")).not.toBeInTheDocument();
  });

  it("handles multiple files when multiple is true", () => {
    const onChange = vi.fn();
    render(<UploadField multiple onChange={onChange} />);
    setFileInput([createFile("a.png", "image/png"), createFile("b.png", "image/png")]);
    const files = onChange.mock.calls[0][0];
    expect(files).toHaveLength(2);
  });

  it("does not show action button in multiple mode", () => {
    render(<UploadField multiple />);
    expect(screen.queryByRole("button", { name: "Upload file" })).not.toBeInTheDocument();
  });

  it("supports controlled single value", () => {
    const file = createFile("avatar.jpg", "image/jpeg");
    render(<UploadField value={file} onChange={() => {}} />);
    expect(screen.getByText("avatar.jpg")).toBeInTheDocument();
  });

  it("supports controlled multiple value", () => {
    const file1 = createFile("a.jpg", "image/jpeg");
    const file2 = createFile("b.jpg", "image/jpeg");
    render(<UploadField value={[file1, file2]} onChange={() => {}} />);
    expect(screen.getByText("a.jpg")).toBeInTheDocument();
    expect(screen.getByText("b.jpg")).toBeInTheDocument();
  });

  it("displays correct icon for image files", () => {
    const file = createFile("photo.jpg", "image/jpeg");
    render(<UploadField value={file} onChange={() => {}} />);
    expect(document.querySelector(".lucide-file-image")).toBeInTheDocument();
  });

  it("displays correct icon for video files", () => {
    const file = createFile("movie.mp4", "video/mp4");
    render(<UploadField value={file} onChange={() => {}} />);
    expect(document.querySelector(".lucide-file-play")).toBeInTheDocument();
  });

  it("displays correct icon for pdf files", () => {
    const file = createFile("doc.pdf", "application/pdf");
    render(<UploadField value={file} onChange={() => {}} />);
    const fileIcon = document.querySelector(".clet-upload-field__file-card-icon");
    expect(fileIcon?.querySelector("svg")).toBeInTheDocument();
  });

  it("displays correct icon for text files", () => {
    const file = createFile("notes.txt", "text/plain");
    render(<UploadField value={file} onChange={() => {}} />);
    expect(document.querySelector(".lucide-file-text")).toBeInTheDocument();
  });

  it("filters files exceeding maxSize", () => {
    const onChange = vi.fn();
    render(<UploadField maxSize={500} onChange={onChange} />);
    setFileInput([createFile("large.jpg", "image/jpeg", 1024)]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders with hidden file input having accept attribute", () => {
    render(<UploadField accept="image/*" />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("accept", "image/*");
  });

  it("renders with hidden file input having name attribute", () => {
    render(<UploadField name="avatar" />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute("name", "avatar");
  });

  it("shows upload button when value is cleared", () => {
    const file = createFile("test.png", "image/png");
    const { rerender } = render(<UploadField value={file} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Replace file" })).toBeInTheDocument();

    rerender(<UploadField value={null} onChange={() => {}} />);
    expect(document.querySelector(".clet-upload-field__action")).toHaveTextContent("Upload file");
  });

  // Uncontrolled mode
  it("manages internal state in uncontrolled mode", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("doc.pdf", "application/pdf")]);
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByText("doc.pdf")).toBeInTheDocument();
  });

  it("removes file in uncontrolled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);
    setFileInput([createFile("notes.txt", "text/plain")]);
    expect(screen.getByText("notes.txt")).toBeInTheDocument();

    const removeButton = screen.getByRole("button", { name: /^Remove /i });
    await user.click(removeButton);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  // RHF integration
  it("works with react-hook-form controlled", () => {
    function Form() {
      const form = useForm<{ file: File | null }>({
        defaultValues: { file: null },
      });
      return (
        <form onSubmit={form.handleSubmit(() => {})}>
          <UploadField
            value={form.watch("file") ?? undefined}
            onChange={(v) => form.setValue("file", v as File | null)}
          />
          <span data-testid="value">
            {form.watch("file")?.name ?? "none"}
          </span>
        </form>
      );
    }

    render(<Form />);
    expect(screen.getByTestId("value")).toHaveTextContent("none");

    setFileInput([createFile("avatar.jpg", "image/jpeg")]);
    expect(screen.getByTestId("value")).toHaveTextContent("avatar.jpg");
  });
});

describe("UploadField file status", () => {
  it("renders a progress bar and cancel control for an uploading file", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const file = createFile("report.pdf", "application/pdf");
    render(
      <UploadField
        multiple
        value={[file]}
        fileStatuses={[{ status: "uploading", progress: 40 }]}
        onCancel={onCancel}
        onChange={() => {}}
      />,
    );

    expect(document.querySelector(".clet-progress-bar")).toBeInTheDocument();
    expect(
      document.querySelector(".clet-progress-bar__indicator"),
    ).toHaveStyle({ width: "40%" });

    const cancelButton = screen.getByRole("button", {
      name: "Cancel upload of report.pdf",
    });
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledWith(file, 0);
  });

  it("renders a completed check icon and keeps the remove button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const file = createFile("report.pdf", "application/pdf");
    render(
      <UploadField
        multiple
        value={[file]}
        fileStatuses={[{ status: "completed" }]}
        onChange={onChange}
      />,
    );

    expect(
      document.querySelector(".clet-upload-field__file-card-completed-icon"),
    ).toBeInTheDocument();

    const removeButton = screen.getByRole("button", {
      name: "Remove report.pdf",
    });
    await user.click(removeButton);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("renders a failed card with red border and Try Again", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const file = createFile("report.pdf", "application/pdf");
    render(
      <UploadField
        multiple
        value={[file]}
        fileStatuses={[{ status: "failed", error: "Network error" }]}
        onRetry={onRetry}
        onChange={() => {}}
      />,
    );

    expect(
      document.querySelector(".clet-upload-field__file-card--failed"),
    ).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try Again" }));
    expect(onRetry).toHaveBeenCalledWith(file, 0);
  });

  it("removes only the targeted file when multiple files are present", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const fileA = createFile("a.txt", "text/plain");
    const fileB = createFile("b.txt", "text/plain");
    render(
      <UploadField multiple value={[fileA, fileB]} onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Remove a.txt" }));
    expect(onChange).toHaveBeenCalledWith([fileB]);
  });
});

describe("FileFormatIcon", () => {
  it("renders a distinct icon per file kind", () => {
    const { container: pdf } = render(
      <FileFormatIcon file={createFile("doc.pdf", "application/pdf")} />,
    );
    const { container: image } = render(
      <FileFormatIcon file={createFile("photo.png", "image/png")} />,
    );
    expect(pdf.querySelector("svg")).toBeInTheDocument();
    expect(image.querySelector("svg")).toBeInTheDocument();
    expect(pdf.innerHTML).not.toBe(image.innerHTML);
  });
});

describe("UploadField file name safety", () => {
  const NUL = String.fromCharCode(0);
  const RTL_OVERRIDE = String.fromCharCode(0x202e);

  it("rejects a poison null byte in the name", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);

    setFileInput([createFile(`shell.php${NUL}.jpg`, "image/jpeg")]);

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("This file name contains hidden control characters. Rename the file and try again."),
    ).toBeInTheDocument();
  });

  it("rejects a path separator in the name", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);

    setFileInput([createFile("../../etc/passwd", "text/plain")]);

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("This file name contains a path separator. Rename the file and try again."),
    ).toBeInTheDocument();
  });

  it("rejects a bidi override that disguises the extension", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);

    setFileInput([createFile(`photo${RTL_OVERRIDE}gnp.exe`, "application/octet-stream")]);

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("This file name contains hidden characters that disguise its real type. Rename the file and try again."),
    ).toBeInTheDocument();
  });

  it("does not echo the raw name back into the dialog", () => {
    render(<UploadField />);

    setFileInput([createFile(`shell.php${NUL}.jpg`, "image/jpeg")]);

    const dialog = document.body.textContent ?? "";
    expect(dialog).not.toContain(NUL);
    expect(dialog).toContain("�");
  });

  it("rejects the whole selection, not just the offending file", () => {
    const onChange = vi.fn();
    render(<UploadField multiple onChange={onChange} />);

    setFileInput([
      createFile("fine.pdf", "application/pdf"),
      createFile(`bad${NUL}.pdf`, "application/pdf"),
    ]);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("accepts an ordinary name", () => {
    const onChange = vi.fn();
    render(<UploadField onChange={onChange} />);

    setFileInput([createFile("quarterly report (final).pdf", "application/pdf")]);

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
