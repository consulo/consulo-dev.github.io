---
title: Basics of Working with the Editor
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

This tutorial will lead you through the series of steps showing how to work with the Consulo Editor, how to access and modify text it contains, and how to handle events sent to the editor.
* [1. Working With Text](editor_basics/working_with_text.md)
* [2. Editor coordinate systems: positions and offsets](editor_basics/coordinates_system.md)
* [3. Handling Editor Events](editor_basics/editor_events.md)

**Note:** The part of the API described in this tutorial only allows operations with text.
For operations that require access to the PSI please see the [PSI Cookbook](/basics/psi_cookbook.md) section.

**See also:**
The following are referenced in the tutorial:
* The editor-ui-api package,
* Those not found in editor-ui-api package:
  * `EditorActionManager`,
  * `EditorActionHandler`,
  * `TypedActionHandler`,
  * `TypedAction`.

**Related topics:**
* [Action System](/tutorials/action_system.md)
* [Threading Issues](/basics/architectural_overview/general_threading_rules.md)
