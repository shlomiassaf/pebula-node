---
id: utilities
title: Utilities
sidebar_label: Utilities
---
import ApiDocsLink from '@site/src/theme/ApiDocsLink';

## getSchemaOf

Returns the mongoose schema for the provided Model / Resource. [<ApiDocsLink type="globals" hash="getSchemaOf">Link</ApiDocsLink>]

## getDiscriminatorKeyFor

Returns the discriminator key for the provided Model / Resource.
Only valid for discriminator implementation, thr base class will not yield a value. [<ApiDocsLink type="globals" hash="getDiscriminatorKeyFor">Link</ApiDocsLink>]

## getDiscriminatorKeysOf

Returns the discriminator keys for the provided Model / Resource. [<ApiDocsLink type="globals" hash="getDiscriminatorKeysOf">Link</ApiDocsLink>]

## findModels

Return all Models / Resources registered in GooseTyped. [<ApiDocsLink type="globals" hash="findModels">Link</ApiDocsLink>]

## getEnum

Returns the list of enums registered for a `path` in a Model / Resource. [<ApiDocsLink type="globals" hash="getEnum">Link</ApiDocsLink>]