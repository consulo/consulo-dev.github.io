---
title: Build Number Ranges
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->
<style>
  table {
    width:100%;
  }
  th:first-child, td:first-child {
    width: 10%;
  }
</style>

Use this reference of build number ranges to specify the correct `since-build` and `until-build` values in your plugin descriptor.

When using Gradle, setting the actual values in `plugin.xml` is usually managed by the `patchPluginXml` task, see [Patching the Plugin Configuration File](/tutorials/build_system/gradle_guide.md#patching-the-plugin-configuration-file) for details.

> **NOTE** Compatibility with specified version range (and compatible products) should always be verified using [Plugin Verifier](/reference_guide/api_changes_list.md#verifying-compatibility) to ensure binary compatibility.

Starting with Consulo, a multi-part build number is used, such as `IU-162.94`.

The number consists of the following parts:

* Product ID (e.g. `CONSULO`)
* Branch number (`162`)
* Build number in the branch (`94`)

Since version 2016.2 of the *Consulo*, branch numbers are based on the `YYYY.R` IDE release version numbers.
The branch number takes the last two digits of the year and the `R` release number.
For example, `162` for 2016.2, `163` for 2016.3, `171` for 2017.1.
In this scheme, `IU-162.94` corresponds to the 2016.2 release.

Starting with 2016.2, the build number may also have multiple components: `IU-162.94`, `IU-162.94.11`, `IU-162.94.11.256.42`.
This gives more flexibility for third-party plugins and IDE developers.
Plugins may specify compatibility versions more precisely; IDE vendors may have build numbers based on a specific *Consulo* version and specify additional internal version (e.g. `256.42` in `XX-162.94.11.256.42`) to allow plugin developers for their IDE to specify compatibility.

Multi-part build numbers can also be used in the `since-build` and `until-build` attributes of `idea-version`.
Usually you should omit the product ID and use only the branch number and build number, for example:

```xml
<idea-version since-build="94.539"/>
<idea-version since-build="162.539.11"/>
<idea-version until-build="162"/> <!-- any build until 162, not inclusive!-->
<idea-version since-build="162" until-build="162.*"/> <!-- any 162-based version, 162.94, 162.94.11, etc.-->
```

> **NOTE** Specific build numbers and their corresponding release version are available via the Consulo releases page.

### Consulo Based Products of Recent IDE Versions

> **TIP** Which versions should your plugin support? Check the Consulo Plugin Repository for download statistics and version usage information.

| Branch number                                                   | Consulo version |
| --------------------------------------------------------------- | ------------------------- |
| 203 | 2020.3 **NOTE** Java 11 is now required |
| 202 | 2020.2                    |
| 201 | 2020.1                    |
| 193 | 2019.3                    |
| 192 | 2019.2                    |
| 191 | 2019.1                    |
| 183 | 2018.3                    |
| 182 | 2018.2                    |
| 181 | 2018.1                    |
| 173 | 2017.3                    |
| 172 | 2017.2                    |
| 171 | 2017.1                    |
| 163 | 2016.3                    |
| 162 | 2016.2                    |

Note that there is no `170`.
In the `YYYY.R` versioning scheme, the `R` part starts at 1.

### Consulo Based Products of Pre-2016.2 IDE Versions

|  Branch number                                                  |  Product version                                                                                                                       |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 145 | Consulo 2016.1 |
| 143 | Consulo 15 |
| 141 | Consulo 14.1 |
| 139 | Consulo 14 |
| 135 | Consulo 13.1 |
| 133 | Consulo 13 |
| 131 | Consulo 13 |
| 129 | Consulo 12.1 |
| 127 | Consulo 12 |
| 125 | Consulo 12 |
| 123 | Consulo 12 |
| 121 | Consulo 11.1 |
| 119 | Consulo 11.1 |
| 117 | Consulo 11.1 |
| 111                                                             | Consulo 11.0                                                                                                                     |
| 107                                                             | Consulo 10.5                                                                                                                     |
| 103                                                             | Consulo 10.0.2+                                                                                                                  |
| 99                                                              | Consulo 10.0+                                                                                                                    |
| 95                                                              | Consulo 9.0.2+                                                                                                                   |
| 93                                                              | Consulo 9.0                                                                                                                      |

## History

### Build Numbers for Consulo Versions

| Consulo version       | Build number  |
| --------------------- | ------------- |
| 12.0                  | 123.72        |
| 11.1.3                | 117.798       |
| 11.1.2                | 117.418       |
| 11.1.1                | 117.117       |
| 11.1                  | 117.105       |
| 11.0.2                | 111.277       |
| 11.0.1                | 111.167       |
| 11.0                  | 111.69        |
| 10.5.2                | 107.587       |
| 10.5.1                | 107.322       |
| 10.5                  | 107.105       |
| 10.0.3                | 103.255       |
| 10.0.2                | 103.72        |
| 10.0.1                | 99.32         |
| 10.0                  | 99.18         |
| 9.0.4                 | 95.627        |
| 9.0.3                 | 95.429        |
| 9.0.2                 | 95.66         |
| 9.0.1                 | 93.94         |
| 9.0                   | 93.13         |

### Build Numbers for Pre-9.0

Before version 9.0, linear build numbers were used, with the following ranges:

| Version               | Build number range |
| --------------------- | ------------------ |
| 8.1.x                 | 9500-9999          |
| 8.0.x                 | 9100-9499          |
| 8.0                   | 8000-9099          |
| 7.0.2+                | 7500-7999          |
| 7.0 final             | 7200-7499          |
| 7.0 pre-M2            | 6900-7199          |
| 7.0 pre-M1            | 6500-6899          |
| 6.0.2 branch          | 6000-6499          |
| 6.0 branch            | 5000-5999          |
| 5.1 branch            | 4000-4999          |

The build number for each release:

| Version               | Build number |
| --------------------- | ------------ |
| 8.1                   | 9732         |
| 8.0.1                 | 9164         |
| 8.0                   | 9013         |
| 8.0M1                 | 8664         |
| 7.0.5                 | 7971         |
| 7.0.3                 | 7757         |
| 7.0.2                 | 7590         |
| 7.0 final             | 7361         |
| 7.0 M2                | 7126         |
| 7.0 M1                | 6813         |
| 6.0.6                 | 6197         |
| 6.0.5                 | 6180         |
| 6.0.1                 | 5784         |
| 5.1.2                 | 4267         |
