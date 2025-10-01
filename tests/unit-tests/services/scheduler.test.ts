import { SchedulerImpl } from "@/services";

describe("Scheduler", () => {
	describe("schedule", () => {
		it("schedules a task with generated key and runs callback, removing task after run", async () => {
			// Arrange
			jest.useFakeTimers();
			const scheduler = new SchedulerImpl();
			const callback = jest.fn();
			const time = new Date(Date.now() + 1000);

			// Act
			const id = scheduler.schedule(time, callback);
			jest.advanceTimersByTime(1000);

			// Assert
			expect(typeof id).toBe("string");
			expect(callback).toHaveBeenCalled();
			// schedule called again with same id should schedule anew since previous is removed after run
			const id2 = scheduler.schedule(new Date(Date.now() + 1000), callback);
			expect(id2).not.toEqual(id);
			jest.useRealTimers();
		});

		it("returns same id and ignores when task with same id already scheduled", () => {
			// Arrange
			jest.useFakeTimers();
			const scheduler = new SchedulerImpl();
			const callback = function someTask() { /* no-op */ } as any;
			const time = new Date(Date.now() + 5000);
			const options = { key: "someTask" };

			// Act
			const id1 = scheduler.schedule(time, callback, options);
			const id2 = scheduler.schedule(time, callback, options);

			// Assert
			expect(id2).toEqual(id1);
			jest.useRealTimers();
		});

		it("ignores past time when ignorePast is true", () => {
			// Arrange
			jest.useFakeTimers();
			const scheduler = new SchedulerImpl();
			const callback = jest.fn();
			const time = new Date(Date.now() - 10000);

			// Act
			const id = scheduler.schedule(time, callback, { ignorePast: true });
			jest.advanceTimersByTime(1000);

			// Assert
			expect(typeof id).toBe("string");
			expect(callback).not.toHaveBeenCalled();
			jest.useRealTimers();
		});

		it("schedules immediately when time is in the past and ignorePast is false", () => {
			// Arrange
			jest.useFakeTimers();
			const scheduler = new SchedulerImpl();
			const callback = jest.fn();
			const time = new Date(Date.now() - 10000);

			// Act
			scheduler.schedule(time, callback, { ignorePast: false });
			jest.advanceTimersByTime(0);

			// Assert
			expect(callback).toHaveBeenCalled();
			jest.useRealTimers();
		});
	});

	describe("cancel", () => {
		it("cancels a scheduled task and prevents callback execution", () => {
			// Arrange
			jest.useFakeTimers();
			const scheduler = new SchedulerImpl();
			const callback = jest.fn();
			const time = new Date(Date.now() + 1000);
			const id = scheduler.schedule(time, callback);

			// Act
			scheduler.cancel(id);
			jest.advanceTimersByTime(1000);

			// Assert
			expect(callback).not.toHaveBeenCalled();
			jest.useRealTimers();
		});
	});

	describe("dispose", () => {
		it("cancels all scheduled tasks", () => {
			// Arrange
			jest.useFakeTimers();
			const scheduler = new SchedulerImpl();
			const callback = jest.fn();
			scheduler.schedule(new Date(Date.now() + 500), callback, { key: "a" });
			scheduler.schedule(new Date(Date.now() + 600), callback, { key: "b" });

			// Act
			scheduler.dispose();
			jest.advanceTimersByTime(1000);

			// Assert
			expect(callback).not.toHaveBeenCalled();
			jest.useRealTimers();
		});
	});
});
