# 0.1.4
- `GET /public/templates/:botid` also returns `ds_version` and `connectors`: the fork of a V3 template is now a V3 agent with the links between its blocks. Before, both were missing and the copy was a V2 agent with no links
- Added `ds_version` and `connectors` to the `faq_kb` model, so the two fields can be read from the template
- A V2 template is unchanged: the two fields are absent from its answer

# 0.1.3
- Version in production before this changelog
