import automationService from './automation.service';
import logger from '../../config/logger';

const SCHEDULER_INTERVAL_MS = 15 * 60 * 1000; // check every 15 minutes

let schedulerHandle: NodeJS.Timeout | null = null;

export function startAutomationScheduler(): void {
  if (schedulerHandle) return; // already running

  logger.info('[Automation Scheduler] Starting — checks every 15 minutes');

  schedulerHandle = setInterval(async () => {
    try {
      logger.info('[Automation Scheduler] Running due rules...');
      await automationService.runDueRules();
    } catch (err: any) {
      logger.error(`[Automation Scheduler] Unhandled error: ${err.message}`);
    }
  }, SCHEDULER_INTERVAL_MS);

  // Allow process to exit even if this timer is active
  if (schedulerHandle.unref) schedulerHandle.unref();
}

export function stopAutomationScheduler(): void {
  if (schedulerHandle) {
    clearInterval(schedulerHandle);
    schedulerHandle = null;
    logger.info('[Automation Scheduler] Stopped');
  }
}
