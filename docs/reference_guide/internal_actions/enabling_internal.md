---
title: Enabling Internal Mode
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

There are useful tools, such as the Internal Actions menu, that are only visible if internal mode is enabled in Consulo.

## Setting Internal Mode in the IDE Properties File
There are multiple ways to enable internal mode, but the simplest is within Consulo:
* Start Consulo.
* From the main menu, select **Help | Edit Custom Properties**.
This selection opens Consulo's `idea.properties` file.
If it does not exist, Consulo will prompt to create one.
* Add the line shown below to the `idea.properties` file:

```properties
idea.is.internal=true
```
* Save the `idea.properties` file and restart Consulo.

The Internal Actions menu is available in **Tools \| Internal Actions**.
