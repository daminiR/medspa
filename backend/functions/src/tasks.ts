/**
 * Cloud Tasks Integration
 * Schedules reminder tasks for appointments
 * Uses Google Cloud Tasks API
 */

import { CloudTasksClient } from '@google-cloud/tasks';
import { taskConfig, reminderTiming } from './config';
import { ReminderType, ReminderTaskPayload, AppointmentDocument } from './types';

// Initialize Cloud Tasks client
const tasksClient = new CloudTasksClient();

/**
 * Schedule a reminder task for an appointment
 * @param appointmentId - The appointment ID
 * @param patientId - The patient ID
 * @param reminderType - Type of reminder (24h, 2h, prep)
 * @param appointmentTime - The appointment start time
 * @param locationId - The location ID
 * @returns Promise resolving to task name or null if scheduling failed
 */
export async function scheduleReminder(
  appointmentId: string,
  patientId: string,
  reminderType: ReminderType,
  appointmentTime: Date,
  locationId: string
): Promise<string | null> {
  try {
    // Calculate when the reminder should be sent
    const reminderOffset = reminderTiming[reminderType];
    const scheduledTime = new Date(appointmentTime.getTime() - reminderOffset);

    // Don't schedule if the time has already passed
    const now = new Date();
    if (scheduledTime <= now) {
      console.log(
        `Reminder ${reminderType} for appointment ${appointmentId} would be in the past, skipping`
      );
      return null;
    }

    // Build the queue path
    const queuePath = tasksClient.queuePath(
      taskConfig.projectId,
      taskConfig.location,
      taskConfig.queue
    );

    // Build the task payload
    const payload: ReminderTaskPayload = {
      appointmentId,
      patientId,
      reminderType,
      scheduledTime: scheduledTime.toISOString(),
      locationId,
    };

    // Create a unique task name to prevent duplicates
    const taskName = `${queuePath}/tasks/reminder-${appointmentId}-${reminderType}-${scheduledTime.getTime()}`;

    // Build the Cloud Task
    const task = {
      name: taskName,
      httpRequest: {
        httpMethod: 'POST' as const,
        url: taskConfig.functionUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        body: Buffer.from(JSON.stringify(payload)).toString('base64'),
        oidcToken: {
          serviceAccountEmail: taskConfig.serviceAccountEmail,
          audience: taskConfig.functionUrl,
        },
      },
      scheduleTime: {
        seconds: Math.floor(scheduledTime.getTime() / 1000),
      },
    };

    // Create the task
    const [response] = await tasksClient.createTask({
      parent: queuePath,
      task,
    });

    console.log(
      `Scheduled ${reminderType} reminder for appointment ${appointmentId} at ${scheduledTime.toISOString()}`
    );

    return response.name || null;
  } catch (error: unknown) {
    // Handle duplicate task error gracefully
    if (error instanceof Error && error.message?.includes('ALREADY_EXISTS')) {
      console.log(
        `Reminder ${reminderType} for appointment ${appointmentId} already scheduled`
      );
      return null;
    }
    console.error(`Error scheduling reminder for ${appointmentId}:`, error);
    throw error;
  }
}

/**
 * Schedule all reminders for a new appointment
 * @param appointment - The appointment document
 * @returns Promise resolving to scheduled task names
 */
export async function scheduleAppointmentReminders(
  appointment: AppointmentDocument
): Promise<{ scheduled: string[]; failed: ReminderType[] }> {
  const scheduled: string[] = [];
  const failed: ReminderType[] = [];

  const reminderTypes: ReminderType[] = ['24h', '2h'];
  const appointmentTime = appointment.startTime.toDate();

  for (const reminderType of reminderTypes) {
    try {
      const taskName = await scheduleReminder(
        appointment.id,
        appointment.patientId,
        reminderType,
        appointmentTime,
        appointment.locationId
      );

      if (taskName) {
        scheduled.push(taskName);
      }
    } catch (error) {
      console.error(
        `Failed to schedule ${reminderType} reminder for ${appointment.id}:`,
        error
      );
      failed.push(reminderType);
    }
  }

  return { scheduled, failed };
}

/**
 * Cancel all scheduled reminders for an appointment
 * @param appointmentId - The appointment ID
 * @returns Promise resolving to number of cancelled tasks
 */
export async function cancelAppointmentReminders(
  appointmentId: string
): Promise<number> {
  let cancelledCount = 0;

  try {
    const queuePath = tasksClient.queuePath(
      taskConfig.projectId,
      taskConfig.location,
      taskConfig.queue
    );

    // List all tasks in the queue
    const [tasks] = await tasksClient.listTasks({
      parent: queuePath,
    });

    // Find and delete tasks for this appointment
    for (const task of tasks) {
      if (task.name?.includes(`reminder-${appointmentId}-`)) {
        try {
          await tasksClient.deleteTask({ name: task.name });
          cancelledCount++;
          console.log(`Cancelled reminder task: ${task.name}`);
        } catch (deleteError) {
          console.error(`Error deleting task ${task.name}:`, deleteError);
        }
      }
    }

    console.log(
      `Cancelled ${cancelledCount} reminder tasks for appointment ${appointmentId}`
    );
  } catch (error) {
    console.error(
      `Error cancelling reminders for appointment ${appointmentId}:`,
      error
    );
  }

  return cancelledCount;
}

/**
 * Reschedule reminders when appointment time changes
 * @param appointment - The updated appointment
 * @returns Promise resolving to rescheduled task info
 */
export async function rescheduleAppointmentReminders(
  appointment: AppointmentDocument
): Promise<{ cancelled: number; scheduled: string[] }> {
  // First, cancel existing reminders
  const cancelled = await cancelAppointmentReminders(appointment.id);

  // Then schedule new ones
  const { scheduled } = await scheduleAppointmentReminders(appointment);

  return { cancelled, scheduled };
}
