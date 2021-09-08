export function isError(argument: unknown): argument is Error {
    if (typeof argument === 'object') {
        return argument instanceof Error;
    }
    return false;
}
