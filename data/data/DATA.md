Data format docs
================

Version 2

Class actions
------------

In version 2 to went from color keyed dictionary to array of dictionaries, and color encoded as key "Color" (for stable order)

```json
[
  [
    {
      "Color": "Red",
      "Name": "Triple Shot",
      "Cost": 3,
      "Actions": [
        {
          "Action": "Attack",
          "Value": -2,
          "Mod": "Target 3"
        }
      ]
    },
    ...
  ]
]

```

Species actions
---------------

No much changes in version 2 besides formatting

Text formatting
-------------------

In action descriptions added a several items: Markdown style words highlighting `*Highlight this*`,
`[p]` - new paragraph breaker and `[icon:name]` - icon placeholder. If bracket style `[tags]` omitted,
collapse spaces around.