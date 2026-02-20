/**
 * Family Activity Feed Poster
 * 
 * Utility functions to post events to all family groups the user belongs to.
 * Call these after key ibadah actions are completed.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Post an activity message to all families the user is in.
 * Fire-and-forget — never throws, never blocks the UI.
 */
export async function postFamilyFeedEvent(
  userId: string,
  activityType: string,
  message: string
): Promise<void> {
  try {
    // Get all families the user belongs to
    const { data: memberships } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId);

    if (!memberships || memberships.length === 0) return;

    // Post to each family concurrently
    await Promise.all(
      memberships.map(m =>
        supabase.from('family_activity_feed').insert({
          family_id: m.family_id,
          user_id: userId,
          activity_type: activityType,
          message,
        })
      )
    );
  } catch {
    // Silently fail — feed posting should never break the core flow
  }
}

/**
 * Milestone: user completed all 5 prayers today
 */
export async function notifyAllPrayersComplete(userId: string, displayName: string) {
  await postFamilyFeedEvent(
    userId,
    'prayer_complete',
    `${displayName} completed all 5 prayers today`
  );
}

/**
 * Milestone: user met their Quran target today
 */
export async function notifyQuranTargetMet(userId: string, displayName: string) {
  await postFamilyFeedEvent(
    userId,
    'quran_target',
    `${displayName} met their Quran target today`
  );
}

/**
 * Milestone: user hit a streak milestone (7, 14, 30 days etc.)
 */
export async function notifyStreakMilestone(userId: string, displayName: string, days: number) {
  await postFamilyFeedEvent(
    userId,
    'streak_milestone',
    `${displayName} hit a ${days}-day Quran streak`
  );
}

/**
 * Milestone: user logged a fasting day
 */
export async function notifyFastingLogged(userId: string, displayName: string) {
  await postFamilyFeedEvent(
    userId,
    'fasting',
    `${displayName} is fasting today`
  );
}
