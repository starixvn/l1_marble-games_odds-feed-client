import { Event } from "@/domain";

export function resultValidator({
    index
}: {
    index: number;
}) {

    return (event: Event) => {
        return !isNullOrUndefinedOrEmpty(event.eventDetails[index].result);
    }
}

export function oddsValidator({
    index,
    shouldValidate = true
}: {
    index: number;
    shouldValidate?: boolean;
}) {
    return (event: Event) => {
        if (!shouldValidate) {
            return true;
        }

        const markets = event.eventDetails[index].markets ?? [];
        if (markets.length === 0) {
            return true; // no market at all mean no need to validate
        }

        for (const market of markets) {
            for (const selection of market.selections) {
                if (isNullOrUndefinedOrEmpty(selection.price)) {
                    return false;
                }
            }
        }

        return true;
    }
}

export function eventScheduleStartValidator({
    index,
    shouldValidate = true
}: {
    index: number;
    shouldValidate?: boolean;
}) {
    return (event: Event) => {
        if (!shouldValidate) {
            return true;
        }

        return !isNullOrUndefinedOrEmpty(event.eventDetails[index].playlist) && !isNullOrUndefinedOrEmpty(event.eventDetails[index].goalInfo);
    }
}

function isNullOrUndefinedOrEmpty(value: string | undefined | null) {
    return value === undefined || value === null || value === "";
}