---
title: Creating Your First Plugin
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

This documentation section will help you get started with developing plugins for the *Consulo*.

There are three supported workflows available for building plugins.
The recommended workflow for new projects is to [use GitHub Template](#using-github-template) or to [use Gradle](#using-gradle) to create everything from scratch.
The old [Plugin DevKit](#using-devkit) workflow still supports existing projects.

The Gradle workflow offers several advantages:
  * Representations of source sets, modules, and projects are portable,
  * Projects of any size or complexity usually require scripts for build management, which Gradle handles natively,
  * Training, documentation, and community help for general Gradle topics are widely available.

Specific to development of Consulo plugins with Gradle:
  * Changing plugin targets is more comfortable because it is all done in `build.gradle`:
      * Switching the version of the target Consulo (IDE),
      * Changing the target Consulo-based IDE.
  * Gradle is fully integrated with Continuous Integration systems, so it is easy to customize and extend the build and publishing processes.
  * Built-in verification task for `plugin.xml` and plugin distribution structure.

## Using GitHub Template

* [Developing plugins using GitHub Template](/tutorials/github_template.md)

## Using Gradle

* [Developing plugins using Gradle](/tutorials/build_system.md)
    * [Getting Started with Gradle](/tutorials/build_system/prerequisites.md)
    * [Configuring Gradle Projects](/tutorials/build_system/gradle_guide.md)
    * [Publishing Plugins with Gradle](/tutorials/build_system/deployment.md)

## Using DevKit
* [Developing plugins using DevKit](getting_started/using_dev_kit.md)
    * [Setting Up a Development Environment](getting_started/setting_up_environment.md)
    * [Creating a Plugin Project](getting_started/creating_plugin_project.md)
    * [Creating Actions](/tutorials/action_system/working_with_custom_actions.md)
    * [Running and Debugging a Plugin](getting_started/running_and_debugging_a_plugin.md)
    * [Deploying a Plugin](getting_started/deploying_plugin.md)
    * [Publishing a Plugin](getting_started/publishing_plugin.md)
