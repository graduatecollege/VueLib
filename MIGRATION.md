# Migration notes

## `@illinois-grad/vue-useful-api`: `apiWatch` and typed arrays

`apiWatch` now treats typed arrays of the same type with the same elements as
equal even when they start at different byte offsets. Replacing
`new Uint8Array([0, 1, 2]).subarray(1)` with `new Uint8Array([1, 2])` no longer
triggers a request on its own. Changing an element still triggers a request.

If the byte offset is part of your request's meaning, include `view.byteOffset`
as a separate value in the arguments returned by your watcher. Other callers
do not need to change.
