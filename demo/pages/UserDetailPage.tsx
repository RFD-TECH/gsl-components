import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Check,
  Mail,
  MapPin,
  Phone,
  Shield,
  Edit,
  User,
  Send,
  Lock,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  MetricCard,
  PageSection,
  QuickActions,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  Timeline,
  TimelineData,
  TimelineFooter,
  TimelineItem,
  TimelineTitle,
} from "@rfdtech/components";
import { auditTrail } from "demo/data/auditTrail";
import { demoUsers } from "demo/data/demoUsers";
import { useMockQuery } from "demo/hooks/useMockQuery";

function statusVariant(status: string) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Pending":
      return "warning" as const;
    case "Inactive":
      return "outline" as const;
    case "Suspended":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export function UserDetailPage() {
  const navigate = useNavigate();
  const params = useParams<{ userId: string }>();
  const user = demoUsers.find((u) => u.id === params.userId) ?? demoUsers[0];
  const { loading: profileLoading } = useMockQuery(null, 800);

  const actions = useMemo(
    () => [
      {
        id: "edit-profile",
        label: "Edit Profile",
        icon: <Edit size={18} strokeWidth={1.5} />,
        description: "Update personal information",
      },
      {
        id: "send-message",
        label: "Send Message",
        icon: <Send size={18} strokeWidth={1.5} />,
        description: "Send an email notification",
      },
      {
        id: "reset-password",
        label: "Reset Password",
        icon: <Lock size={18} strokeWidth={1.5} />,
        description: "Trigger password reset",
      },
    ],
    [],
  );

  const [hiddenQuickActions, setHiddenQuickActions] = useState<Set<string>>(
    () => new Set(),
  );

  const visibleActions = useMemo(
    () => actions.filter((a) => !hiddenQuickActions.has(a.id)),
    [actions, hiddenQuickActions],
  );

  return (
    <>
      <PageSection>
        <SectionHeader>
          <SectionTitle>{user.name}</SectionTitle>
          <SectionDescription>
            User profile and activity history.
          </SectionDescription>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to Dashboard
          </Button>
        </SectionHeader>
      </PageSection>

      <PageSection>
        <div className="user-profile__layout">
          <div className="user-profile__left">
            <div className="user-profile__card">
              <div className="user-profile__avatar">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="user-profile__info">
                <div className="user-profile__name-row">
                  <h2 className="user-profile__name">{user.name}</h2>
                  <Badge variant={statusVariant(user.status)}>
                    {user.status}
                  </Badge>
                </div>
                <div className="user-profile__details">
                  <div className="user-profile__detail">
                    <Mail size={14} strokeWidth={1.5} />
                    {user.email}
                  </div>
                  <div className="user-profile__detail">
                    <Phone size={14} strokeWidth={1.5} />
                    {user.phone}
                  </div>
                  <div className="user-profile__detail">
                    <Shield size={14} strokeWidth={1.5} />
                    {user.role}
                  </div>
                  <div className="user-profile__detail">
                    <MapPin size={14} strokeWidth={1.5} />
                    {user.location}
                  </div>
                  <div className="user-profile__detail">
                    <Calendar size={14} strokeWidth={1.5} />
                    Joined {user.joined}
                  </div>
                </div>
                {user.bio && (
                  <p className="user-profile__bio">{user.bio}</p>
                )}
              </div>
            </div>

            <div className="user-profile__metrics">
              <MetricCard
                variant="outline"
                loading={profileLoading}
                label="Actions Taken"
                value={24}
                description="This month"
                trend="up"
                trendValue="+8%"
                icon={<User size={18} strokeWidth={1.5} aria-hidden />}
              />
              <MetricCard
                variant="outline"
                loading={profileLoading}
                label="Documents Filed"
                value={12}
                description="Total submitted"
                icon={<Check size={18} strokeWidth={1.5} aria-hidden />}
              />
              <MetricCard
                variant="outline"
                loading={profileLoading}
                label="Last Active"
                value="2h ago"
                description="Online activity"
                icon={<Calendar size={18} strokeWidth={1.5} aria-hidden />}
              />
            </div>

            <QuickActions
              title="User actions"
              actions={visibleActions}
              customizable
              hiddenIds={hiddenQuickActions}
              onToggleVisibility={(id) => {
                setHiddenQuickActions((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) {
                    next.delete(id);
                  } else {
                    next.add(id);
                  }
                  return next;
                });
              }}
            />
          </div>

          <div className="user-profile__right">
            <Card bordered>
              <h3 className="user-profile__card-title">Activity</h3>
              <Timeline>
                {auditTrail.slice(0, 6).map((event) => (
                  <TimelineItem
                    key={event.id}
                    mode={event.mode}
                  >
                    <TimelineTitle>{event.title}</TimelineTitle>
                    <TimelineData>{event.date}</TimelineData>
                    <TimelineFooter>{event.description}</TimelineFooter>
                  </TimelineItem>
                ))}
              </Timeline>
            </Card>
          </div>
        </div>
      </PageSection>
    </>
  );
}
