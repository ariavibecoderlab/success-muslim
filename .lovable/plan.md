

# Admin Dashboard — Comprehensive Audit & Upgrade Plan

---

## PART 1 — AUDIT OF CURRENT /admin

### Pages/Sections
| Route | Page | Purpose |
|-------|------|---------|
| `/admin` | AdminDashboard | Overview KPIs + signup chart + module usage |
| `/admin/users` | AdminUsers | User list with filters, bulk actions, detail sheet |
| `/admin/analytics` | AdminAnalytics | Focus areas, consistency breakdown, geo, retention cohorts |
| `/admin/dawah` | AdminDawah | Upload/manage Da'wah posters |
| `/admin/announcements` | AdminAnnouncements | Create/toggle/delete announcements |
| `/admin/system` | AdminSystem | DB/Auth/Storage health checks, recent errors |

### Metrics Currently Tracked
- Total users, today's signups, DAU, MAU
- Onboarding completion rate / drop-off
- Signup chart (7/30/90 day bars + cumulative line)
- Module usage (unique users per module from `user_activity`)
- Retention cohorts (D1/D3/D7/D14/D30)
- Focus area distribution, consistency level pie, top countries/cities

### Actions Admin Can Currently Do
- View/search/filter/sort users (by country, onboarding, role, status)
- View individual user detail + recent activity
- Assign/change roles (admin/moderator/user)
- Enable/disable users
- Delete users (single + bulk)
- Export user list to CSV
- Upload/delete Da'wah posters
- Create/toggle/delete announcements
- View system health (DB latency, Auth session, Storage status)

### What's Missing (High Value)
1. **No feature-specific analytics** — zero visibility into prayer, Quran, fasting, dhikr, health, productivity, or wealth usage
2. **No Family/Class management** — can't see groups, member counts, or moderate
3. **No content management** for daily quotes (currently hardcoded)
4. **No notification/broadcast system** beyond text announcements
5. **No audit log viewer** — `admin_audit_log` table exists but no UI
6. **No real-time activity feed** — can't see what's happening now
7. **"Avg Session" and "D7 Retention" cards show "—"** — placeholder, never implemented
8. **No user journey/funnel visualization**
9. **No data export** beyond user CSV

---

## PART 2 — INVENTORY OF ALL APP DATA

### IMAN Module
| Table | Key Data |
|-------|----------|
| `salah_logs` | user_id, date, prayer_name, status (on_time/late/missed/qada), logged_at |
| `quran_reading_log` | user_id, date, start/end surah+ayah, ayah_count, page_count, juz_segments, log_type |
| `quran_reading_sessions` | user_id, date, pages_read, ayahs_read, duration_seconds |
| `quran_preferences` | daily_goal_pages, daily_target_type, font_size, translation_lang |
| `quran_log` | pages_read, juz_number, surah_name (legacy) |
| `dhikr_sessions` | user_id, date, count, target, preset_id |
| `fasting_log` | user_id, date |
| `ramadan_daily_log` | fasted, quran_pages, tarawih_rakaat, dhikr_count, charity_amount, selawat_count, sunnah_solat |
| `ramadan_settings` | suhoor/iftar alarm, daily goals |
| `qiyam_log` | performed, sleep_time, wake_time, tahajjud_start |
| `qada_solat` | setup (years missed), progress per prayer |
| `ramadhan_qada` | setup, progress |
| `fidyah_history` | calculation entry |
| `sadaqah_donations` | amount, category, recipient, currency |
| `sadaqah_goals` | monthly_target, currency |
| `prayer_settings` | location, calculation_method, madhab, adhan_settings |
| `dakwah_posters` | title, image_url, date |

### HEALTH Module
| Table | Key Data |
|-------|----------|
| `user_health_profiles` | age, height, weight, goal, BMI, TDEE, fasting_experience, recommended_protocol |
| `health_bmi` | weight, height, age, bmi, tdee, activity_level |
| `weight_log` | date, weight |
| `sleep_log` | date, duration, bedtime, wake_time |
| No `steps_log` or `hydration_log` tables (likely localStorage only) |

### FAMILY Module
| Table | Key Data |
|-------|----------|
| `families` | name, group_type (family/class), mode, invite_code |
| `family_members` | family_id, user_id, role (admin/member), is_visible |
| `family_privacy_settings` | show_prayer/quran/fasting/health/streaks, ghost_mode |
| `family_reactions` | feed_id, reaction_type |
| `family_activity_feed` | (referenced but not in provided schema — likely exists) |

### USER Data
| Table | Key Data |
|-------|----------|
| `profiles` | display_name, gender, city, country, avatar_url, focus_areas, consistency_level, onboarding_step/completed, is_disabled |
| `user_roles` | user_id, role (admin/moderator/user) |
| `user_activity` | module, action, metadata, created_at |
| `daily_checkins` | date, streak_day, points_earned |

### PRODUCTIVITY
| Table | Key Data |
|-------|----------|
| `daily_tasks` | date, text, completed, is_mit |
| `widget_preferences` | widget_id, enabled, position, size |

### WEALTH
| Table | Key Data |
|-------|----------|
| `transactions` | type, category, amount, date, is_recurring |
| `savings_goals` | name, target_amount, current_amount, goal_type |
| `savings_contributions` | goal_id, amount, date |

### GAMIFICATION / OTHER
| Table | Key Data |
|-------|----------|
| `daily_checkins` | streak_day, points_earned |
| `app_stats` | stat_key, stat_value (global counters) |
| `admin_audit_log` | admin_id, action, target_type, target_id, metadata |
| `page_overrides` | CMS overrides |
| `announcements` | title, content, is_active |

---

## PART 3 — PROPOSED IDEAL ADMIN DASHBOARD

### Sidebar Navigation (updated)
```text
  Overview
  Users
  Engagement
  Iman Analytics
  Health Analytics
  Family & Class
  Content
  Audit Log
  System
```

### 1. OVERVIEW (landing page)
**KPI Cards (top row):**
- Total Users | Today's Signups | DAU | MAU | WAU
- Avg Daily Checkin Streak | Total Prayers Logged Today | Active Fasters Today

**Charts:**
- User Growth (existing — keep)
- Daily Active Users trend (7/30/90d line chart)
- Today's Activity Heatmap (by hour, showing when users are most active)

**Live Feed Widget:**
- Real-time ticker: "User X completed Isha" / "New signup from Malaysia" (from `user_activity`, last 20 entries)

**Alerts Banner:**
- System errors in last 24h count
- Users with disabled accounts pending review
- Announcements expiring soon

### 2. USERS (existing — enhance)
Keep everything current. Add:
- **User detail drawer**: show prayer completion %, Quran pages this week, checkin streak, family memberships
- **Email column** (from auth — needs new RPC)
- **Cohort tag** (week of signup) for quick filtering

### 3. ENGAGEMENT ANALYTICS (new page)
- **Feature Adoption Funnel**: % of users who have used each module at least once (Salah, Quran, Dhikr, Fasting, IF Timer, Tasks, Budget, Family)
- **DAU/WAU/MAU trend** (line chart)
- **Module Usage Over Time** (stacked area chart — which modules are growing)
- **Daily Checkin Stats**: total checkins today, avg streak, streak distribution histogram
- **Widget Popularity**: which dashboard widgets are most enabled

### 4. IMAN ANALYTICS (new page)
- **Prayer Completion Rate**: aggregate % of prayers logged as on_time vs late vs missed (today / this week / this month)
- **Top Prayers Missed**: which of the 5 prayers is most commonly missed
- **Quran Reading**: total pages read this week across all users, avg pages/user, users who met daily target
- **Dhikr**: total counts today, avg per session, most popular presets
- **Fasting**: users currently fasting (today in `fasting_log`), Ramadan participation rates
- **Sadaqah**: total donated this month, top categories

### 5. HEALTH ANALYTICS (new page)
- **IF Timer**: users with active health profiles, protocol distribution (16:8, 18:6, etc.)
- **BMI Distribution**: histogram of user BMI ranges
- **Sleep**: avg sleep duration across users, bedtime distribution
- **Weight Trends**: users tracking weight, avg weight change

### 6. FAMILY & CLASS MANAGEMENT (new page)
- **Groups Overview**: total families, total classes, total members
- **Largest Groups** table (name, type, member count, created date)
- **Admin can view group details** (members list, leaderboard preview)
- **Moderate**: ability to delete groups or remove members if needed

### 7. CONTENT MANAGEMENT (existing pages — consolidate)
- Merge Da'wah + Announcements under one "Content" tab with sub-tabs
- Add: **Daily Quotes** management (currently hardcoded in `constants.ts`)
- Add: **CMS Overrides** viewer (from `page_overrides` table)

### 8. AUDIT LOG (new page)
- Searchable table of `admin_audit_log`
- Columns: Admin Name, Action, Target, Timestamp, Metadata
- Filters: by admin, by action type, by date range

### 9. SYSTEM HEALTH (existing — enhance)
- Keep existing DB/Auth/Storage checks
- Add: **Table row counts** (profiles, salah_logs, etc.)
- Add: **Storage usage** per bucket
- Add: **Edge function status**

---

## PART 4 — IMPLEMENTATION PLAN

### New RPC Functions Needed

| # | Function | Purpose | Complexity |
|---|----------|---------|------------|
| 1 | `admin_engagement_stats` | DAU/WAU/MAU trends, feature adoption rates | Medium |
| 2 | `admin_iman_stats` | Prayer completion rates, Quran stats, dhikr totals, fasting counts | Medium |
| 3 | `admin_health_stats` | BMI distribution, IF protocol distribution, sleep averages | Low |
| 4 | `admin_family_overview` | Group counts, largest groups, member totals | Low |
| 5 | `admin_checkin_stats` | Streak distribution, daily checkin counts | Low |
| 6 | `admin_widget_popularity` | Most enabled widgets from `widget_preferences` | Low |
| 7 | `admin_table_sizes` | Row counts for all key tables | Low |
| 8 | `admin_live_feed` | Last 20 activity entries with user names | Low |

### New UI Components

| # | Component | File | Complexity |
|---|-----------|------|------------|
| 1 | AdminEngagement page | `src/pages/admin/AdminEngagement.tsx` | Medium |
| 2 | AdminImanAnalytics page | `src/pages/admin/AdminImanAnalytics.tsx` | Medium |
| 3 | AdminHealthAnalytics page | `src/pages/admin/AdminHealthAnalytics.tsx` | Low |
| 4 | AdminFamilies page | `src/pages/admin/AdminFamilies.tsx` | Medium |
| 5 | AdminAuditLog page | `src/pages/admin/AdminAuditLog.tsx` | Low |
| 6 | LiveActivityFeed component | `src/components/admin/LiveActivityFeed.tsx` | Low |
| 7 | Updated AdminSidebar | Update nav items | Trivial |
| 8 | Updated AdminDashboard | Add live feed + alerts | Low |
| 9 | Updated AdminSystem | Add table sizes | Low |

### Modified Files
- `src/App.tsx` — add new admin routes
- `src/components/admin/AdminSidebar.tsx` — add new nav items
- `src/pages/admin/AdminDashboard.tsx` — add live feed widget, alerts
- `src/pages/admin/AdminSystem.tsx` — add table sizes
- Merge Da'wah + Announcements into Content tab (optional, lower priority)

### Suggested Implementation Order

```text
Phase 1 — Foundation (4 items)
  1. Create 8 new RPC functions (single migration)
  2. AdminEngagement page (DAU/WAU/MAU + feature adoption)
  3. AdminAuditLog page
  4. Update sidebar + routes

Phase 2 — Domain Analytics (3 items)
  5. AdminImanAnalytics page
  6. AdminHealthAnalytics page
  7. AdminFamilies page

Phase 3 — Polish (3 items)
  8. Live activity feed on Overview
  9. Enhanced user detail drawer
  10. System health table sizes + storage
```

### Complexity Estimate
- **Phase 1**: ~2 sessions (RPCs + 2 new pages + routing)
- **Phase 2**: ~2 sessions (3 analytics pages with charts)
- **Phase 3**: ~1 session (enhancements to existing pages)

Total: ~5 implementation sessions

