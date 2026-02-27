---
title: Creating Your First Plugin
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

This documentation section will help you get started with developing plugins for the *Consulo*.

There are three supported workflows available for building plugins.
The recommended workflow for new projects is to [use GitHub Template](#using-github-template) or to [use Maven](#using-maven) to create everything from scratch.
The old [Plugin DevKit](#using-devkit) workflow still supports existing projects.

The Maven workflow offers several advantages:
  * Representations of source sets, modules, and projects are portable,
  * Projects of any size or complexity usually require scripts for build management, which Maven handles natively,
  * Training, documentation, and community help for general Maven topics are widely available.

Specific to development of Consulo plugins with Maven:
  * Changing plugin targets is more comfortable because it is all done in `pom.xml`:
      * Switching the version of the target Consulo (IDE),
      * Changing the target Consulo-based IDE.
  * Maven is fully integrated with Continuous Integration systems, so it is easy to customize and extend the build and publishing processes.

## Using GitHub Template

* [Developing plugins using GitHub Template](/tutorials/github_template.md)

## Using Maven

* [Developing plugins using Maven](/tutorials/build_system.md)
    * [Getting Started with Maven](/tutorials/build_system/prerequisites.md)
    * [Configuring Maven Projects](/tutorials/build_system/maven_guide.md)
    * [Publishing Plugins with Maven](/tutorials/build_system/deployment.md)

## Using DevKit
* [Developing plugins using DevKit](getting_started/using_dev_kit.md)
    * [Setting Up a Development Environment](getting_started/setting_up_environment.md)
    * [Creating a Plugin Project](getting_started/creating_plugin_project.md)
    * [Creating Actions](/tutorials/action_system/working_with_custom_actions.md)
    * [Running and Debugging a Plugin](getting_started/running_and_debugging_a_plugin.md)
    * [Deploying a Plugin](getting_started/deploying_plugin.md)
    * [Publishing a Plugin](getting_started/publishing_plugin.md)
