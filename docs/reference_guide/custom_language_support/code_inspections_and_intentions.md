---
title: Code Inspections and Intentions
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

### Inspections

The code inspections for custom languages use the same API as all other code inspections, based on the [`LocalInspectionTool`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/inspection/LocalInspectionTool.java) (`consulo.language.editor.inspection.LocalInspectionTool`) class.

The functionality of `LocalInspectionTool` partially duplicates that of [Annotator](syntax_highlighting_and_error_highlighting.md#annotator).

The main differences are:
- supports batch analysis of code (through the **Analyze \| Inspect Code...** action)
- the possibility to turn off the inspection (globally or by suppressing them on various levels)
- ability to configure the inspection options.

If none of that is required and the analysis only needs to run in the active editor, [Annotator](syntax_highlighting_and_error_highlighting.md#annotator) provides better performance (because it supports incremental analysis) and more flexibility for highlighting errors.

**Examples**:
- [Code Inspections Tutorial](/tutorials/code_inspections.md)
- A simple inspection for Properties language plugin


### Intentions

The code intentions for custom languages also use the standard API for intentions.
The intention classes need to implement the [`IntentionAction`](https://github.com/consulo/consulo/blob/master/modules/base/language-editor-api/src/main/java/consulo/language/editor/intention/IntentionAction.java) (`consulo.language.editor.intention.IntentionAction`) interface and are registered using the `consulo.intentionAction` extension point.

**Examples:**
- [Code Intentions Tutorial](/tutorials/code_intentions.md)
- A simple intention action for Groovy
- [Custom Language Support Tutorial: Quick Fix](/tutorials/custom_language_support/quick_fix.md)
