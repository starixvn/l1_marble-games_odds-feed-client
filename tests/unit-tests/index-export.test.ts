describe("package index exports", () => {
	describe("re-exports", () => {
		it("exposes selected interfaces and domain types", () => {
			// Arrange
			// Act
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const mod = require("@/");

			// Assert
			expect(mod).toHaveProperty("oddsFeedEventName");
			expect(mod).toHaveProperty("SystemEventName");
		});
	});
});
