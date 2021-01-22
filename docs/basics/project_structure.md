---
title: Project Structure
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

This topic considers the concept of projects based on the Consulo and related subjects, such as _modules_, _libraries_, and _SDK_.

## Project and Its Components
This section briefly discusses the Consulo project structure, project components, and related terms.
For more information about projects and their components, refer to [Project](https://www.jetbrains.com/help/idea/about-projects.html), [Module](https://www.jetbrains.com/help/idea/creating-and-managing-modules.html), [Library](https://www.jetbrains.com/help/idea/working-with-libraries.html), [Facet](https://www.jetbrains.com/help/idea/adding-support-for-frameworks-and-technologies.html#facets) in the IntelliJ IDEA Web Help.

### Project
In the Consulo, a _project_ encapsulates all of a project's source code, libraries, and build instructions into a single organizational unit.
Everything done using the Consulo SDK is done within the context of a project.
A project defines collections referred to as _modules_ and _libraries_.
Depending on the project's logical and functional requirements, you can create a _single-module_ or a _multi-module_ project.

### Module
A _module_ is a discrete unit of functionality that can be run, tested, and debugged independently.
Modules include such things as source code, build scripts, unit tests, deployment descriptors, etc.
In a project, each module can use a specific SDK or inherit the SDK defined at the project level (see the [SDK](#sdk) section below in this document).
A module can depend on other modules of the project.

### Library
A _library_ is an archive of compiled code (such as JAR files) on which modules depend.
The Consulo supports three types of libraries:
* **Module Library**: the library classes are visible only in this module, and the library information is recorded in the module's `.iml` file.
* **Project Library**: the library classes are visible within the project, and the library information is recorded in the project's `.ipr` file or in `.idea/libraries`.

For more information about libraries, refer to [Library](https://www.jetbrains.com/help/idea/working-with-libraries.html).

### SDK
Every project uses a Software Development Kit (_SDK_).
For Java projects, SDK is referred to as JDK (Java Development Kit).

The SDK determines which API library is used to build the project.
If a project is multi-module, the project SDK is common for all modules within the project by default.
Optionally, a project can configure an individual SDK for each module.

For more information about SDKs, see [Working with SDKs](https://www.jetbrains.com/help/idea/working-with-sdks.html) in the IntelliJ IDEA Web Help.

### Facet
A _facet_ represents a certain configuration, specific for a particular framework/technology associated with a module.
A module can have multiple facets.
E.g., Spring-specific configuration is stored in a Spring facet.

Facets are documented under [Facet](https://www.jetbrains.com/help/idea/adding-support-for-frameworks-and-technologies.html#facets) and [Language and Framework Specific Guidelines](https://www.jetbrains.com/help/idea/language-and-framework-specific-guidelines.html) in the IntelliJ IDEA Web Help.

## Additional Information
For more information on each of these entities, see:

- [Project](/reference_guide/project_model/project.md)
- [Module](/reference_guide/project_model/module.md)
- [SDK](/reference_guide/project_model/sdk.md)
- [Library](/reference_guide/project_model/library.md)
- [External system integration](/reference_guide/frameworks_and_external_apis/external_system_integration.md) (for projects imported from Gradle or similar build systems)
