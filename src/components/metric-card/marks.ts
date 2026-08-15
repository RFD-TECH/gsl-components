import adinkraHene from "./assets/adinkra-hene.png";
import akofena from "./assets/akofena.png";
import akokoNan from "./assets/akoko-nan.png";
import akomaNtoaso from "./assets/akoma-ntoaso.png";
import epa from "./assets/epa.png";
import hwemudua from "./assets/hwemudua.png";
import mateMasie from "./assets/mate-masie.png";
import mpuannum from "./assets/mpuannum.png";
import nkyimkyim from "./assets/nkyimkyim.png";
import nkyimu from "./assets/nkyimu.png";
import nyansapo from "./assets/nyansapo.png";
import oheneAdwa from "./assets/ohene-adwa.png";
import oheneAniwa from "./assets/ohene-aniwa.png";
import okodeeMmowere from "./assets/okodee-mmowere.png";
import osramNeNsroma from "./assets/osram-ne-nsroma.png";
import sepow from "./assets/sepow.png";
import type { MetricCardMark } from "../../types/metric-card";

/** Order matters: `pickMark` indexes into MARK_IDS. Append new ones at the end. */
export const MARKS: Record<MetricCardMark, string> = {
  "adinkra-hene": adinkraHene,
  akofena,
  "akoko-nan": akokoNan,
  "akoma-ntoaso": akomaNtoaso,
  epa,
  hwemudua,
  "mate-masie": mateMasie,
  mpuannum,
  nkyimkyim,
  nkyimu,
  nyansapo,
  "ohene-adwa": oheneAdwa,
  "ohene-aniwa": oheneAniwa,
  "okodee-mmowere": okodeeMmowere,
  "osram-ne-nsroma": osramNeNsroma,
  sepow,
};

export const MARK_IDS = Object.keys(MARKS) as MetricCardMark[];

/** FNV-1a, so the same label always draws the same mark. */
export function pickMark(seed: string): MetricCardMark {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return MARK_IDS[hash % MARK_IDS.length];
}
