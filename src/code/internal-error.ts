/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { logger } from './logger';

/** @public */
export abstract class InternalError extends Error {
    constructor(errorType: string, readonly code: string, message?: string) {
        super(message === undefined || message === '' ?
            `${errorType}: ${code}`
            :
            `${errorType}: ${code}: ${message}`);
        logger.logError(this.message, 120);
    }
}

/** @public */
export namespace InternalError {
    export const enum ExtraFormatting {
        Ignore,
        PrependWithColonSpace,
        PrependWithColonSpaceQuoteError,
        Postpend,
        PostpendColonSpace,
        PostpendColonSpaceQuoted,
    }

    export function formatExtra(existingMessage: string, extraMessage: string, extraFormatting: ExtraFormatting) {
        switch (extraFormatting) {
            case ExtraFormatting.Ignore: return existingMessage;
            case ExtraFormatting.PrependWithColonSpace: return `${extraMessage}: ${existingMessage}`;
            case ExtraFormatting.PrependWithColonSpaceQuoteError: return `${extraMessage}: "${existingMessage}"`;
            case ExtraFormatting.Postpend: return `${existingMessage}${extraMessage}`;
            case ExtraFormatting.PostpendColonSpace: return `${existingMessage}: ${extraMessage}`;
            case ExtraFormatting.PostpendColonSpaceQuoted: return `${existingMessage}: "${extraMessage}"`;
            default:
                throw new UnreachableCaseError('IEAIECINE87339', extraFormatting);
        }
    }

    export function appendToErrorMessage(e: unknown, appendText: string) {
        if (e instanceof Error) {
            e.message += appendText;
            return e;
        } else {
            if (typeof e === 'string') {
                e += appendText;
                return e;
            } else {
                return e; // Do not know how to append
            }
        }
    }

    export function prependErrorMessage(e: unknown, prependText: string) {
        if (e instanceof Error) {
            e.message = prependText + e.message;
            return e;
        } else {
            if (typeof e === 'string') {
                e = prependText + e;
                return e;
            } else {
                return e; // Do not know how to prepend
            }
        }
    }
}

/** @public */
export class AssertInternalError extends InternalError {
    constructor(code: string, message?: string) {
        super('Assert', code, message);
    }
}

/** @public */
export namespace AssertInternalError {
    export function createIfNotError(
        e: unknown,
        code: string,
        extraMessage?: string,
        extraFormatting?: InternalError.ExtraFormatting
    ): Error {
        if (e instanceof Error) {
            let message: string;
            if (extraMessage === undefined) {
                message = `${code}: ${e.message}`;
            } else {
                if (extraFormatting === undefined) {
                    extraFormatting = InternalError.ExtraFormatting.PostpendColonSpaceQuoted;
                }
                const formattedMessage = InternalError.formatExtra(e.message, extraMessage, extraFormatting);
                if (formattedMessage.length === 0) {
                    message = code;
                } else {
                    message = `${code}: ${formattedMessage}`;
                }
            }
            e.message = message;
            return e;
        } else {
            if (typeof e === 'string' && extraFormatting !== undefined) {
                if (extraMessage === undefined) {
                    extraMessage = code;
                }
                const message = InternalError.formatExtra(e, extraMessage, extraFormatting);
                return new AssertInternalError(code, message);
            } else {
                return new AssertInternalError(code, extraMessage);
            }
        }
    }

    export function throwErrorIfPromiseRejected<T>(
        promise: Promise<T>,
        code: string,
        extraMessage?: string,
        extraFormatting?: InternalError.ExtraFormatting
    ): void {
        promise.then(
            () => {/**/},
            (reason) => { throw AssertInternalError.createIfNotError(reason, code, extraMessage, extraFormatting); }
        );
    }
}

/** @public */
export class NotImplementedError extends InternalError {
    constructor(code: string) {
        super('NotImplemented', code);
    }
}

/** @public */
export class UnexpectedUndefinedError extends InternalError {
    constructor(code: string, message?: string) {
        super('UnexpectedUndefined', code, message);
    }
}

/** @public */
export class UnexpectedTypeError extends InternalError {
    constructor(code: string, message: string) {
        super('UnexpectedType', code, message);
    }
}

/** @public */
export class UnreachableCaseError extends InternalError {
    constructor(code: string, value: never, errorText?: string) {
        if (errorText === undefined) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            errorText = `"${value}"`;
        }
        super('UnreachableCase', code, errorText);
    }
}

/** @public */
export class UnexpectedCaseError extends InternalError {
    constructor(code: string, message?: string) {
        super('UnexpectedCase', code, message);
    }
}

/** @public */
export class EnumInfoOutOfOrderError extends InternalError {
    constructor(enumName: string, outOfOrderInfoElementIndex: number, infoDescription: string) {
        super('EnumInfoOutOfOrder', enumName,  `${outOfOrderInfoElementIndex}: ${infoDescription.substring(0, 100)}`);
    }
}
