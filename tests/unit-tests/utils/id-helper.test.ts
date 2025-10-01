import { idHelper } from "@/utils";

describe("idHelper", () => {
    describe("createEventId", () => {
        it("creates an event id encodes game and round", () => {
            // Arrange
            const gameId = 123;
            const roundId = 456789;

            // Act
            const eventId = idHelper.createEventId(gameId, roundId);

            // Assert
            expect(idHelper.extractGameId(eventId)).toBe(String(gameId));
            expect(idHelper.extractRoundId(eventId)).toBe(roundId);
        });

        it("throws on out of range inputs", () => {
            // Arrange
            const tooLargeGameId = 2 ** 16;
            const tooLargeRoundId = 2 ** 32;

            // Act
            const callGame = () => idHelper.createEventId(tooLargeGameId, 0);
            const callRound = () => idHelper.createEventId(0, tooLargeRoundId);

            // Assert
            expect(callGame).toThrow("gameId out of range");
            expect(callRound).toThrow("roundId out of range");
        });
    });

    describe("extractGameId", () => {
        it("extracts game id as string", () => {
            // Arrange
            const gameId = 42;
            const roundId = 7;
            const eventId = idHelper.createEventId(gameId, roundId);

            // Act
            const extracted = idHelper.extractGameId(eventId);

            // Assert
            expect(extracted).toBe("42");
        });
    });

    describe("extractRoundId", () => {
        it("extracts round id as number", () => {
            // Arrange
            const gameId = 10;
            const roundId = 9999;
            const eventId = idHelper.createEventId(gameId, roundId);

            // Act
            const extracted = idHelper.extractRoundId(eventId);

            // Assert
            expect(extracted).toBe(roundId);
        });
    });
});


