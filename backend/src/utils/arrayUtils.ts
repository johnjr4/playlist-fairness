export function partition<T>(
    array: T[],
    predicate: (item: T) => boolean
): [T[], T[]] {
    return array.reduce<[T[], T[]]>(
        ([pass, fail], curr) => {
            (predicate(curr) ? pass : fail).push(curr);
            return [pass, fail];
        },
        [[], []]
    );
}