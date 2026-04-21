# GTM Custom HTML Tag JavaScript Constraints

GTM's Custom HTML tag runs in a browser-script sandbox with constraints that differ from modern ES. Load this file before writing or reviewing JS inside a Custom HTML tag.

## No ES2018 object spread

GTM sandbox reports `This language feature is only supported for ECMASCRIPT_2018 mode or better: object literals with spread`. Use `Object.assign` with conditional ternaries instead:

```js
// WRONG — fails in GTM
var payload = { a: 1, ...(cond && { b: 2 }) }

// CORRECT — works in GTM
var payload = Object.assign({}, { a: 1 }, cond ? { b: 2 } : {})
```

## `Object.assign` first arg must be `{}`

Never pass a GTM variable (like `{{cjs - common properties}}`) as the first argument. `Object.assign` mutates the first arg; if the variable returns a cached reference, you'll corrupt it:

```js
// WRONG — mutates whatever {{cjs - ...}} returns
var payload = Object.assign({{cjs - common properties}} || {}, { ... })

// CORRECT — safe
var payload = Object.assign({}, {{cjs - common properties}} || {}, { ... })
```

## Frontend / GTM split for event payloads

Keep the frontend payload as raw camelCase keys (`keyword`, `hotKeyword`, `sourceId`...) and let the GTM tag map them to final property names (`Keyword`, `Hot Keyword`, `Source ID`...). Global context values (region ID, user ID, etc.) are best read in GTM from `{{dlv - store}}` via a custom JS variable rather than sent from every frontend event.
