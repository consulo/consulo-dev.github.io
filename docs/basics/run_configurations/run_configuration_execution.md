---
title: Execution
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

The standard execution of a run action goes through the following steps:

* The user selects a *run configuration* (for example, by choosing one from the run configurations combobox) and an *executor*  (for example, by pressing a toolbar button created by the executor).
* The *program runner* that will actually execute the process is selected by polling all registered program runners and asking whether they can run the specified run profile with the specified executor ID.
* The [`ExecutionEnvironment`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/runner/ExecutionEnvironment.java) object is created.
  This object aggregates all the settings required to execute the process and the selected [`ProgramRunner`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/runner/ProgramRunner.java).
* [`ProgramRunner`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/runner/ProgramRunner.java)`.execute()` is called, receiving the executor and the execution environment.

Implementations of `ProgramRunner.execute()` go through the following steps to execute the process:

* [`RunProfile`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/configuration/RunProfile.java)`.getState()` method is called to create a [`RunProfileState`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/configuration/RunProfileState.java) object, describing a process about to be started.
  At this stage, the command line parameters, environment variables, and other information required to start the process are initialized.
* `RunProfileState.execute()` is called.
  It starts the process, attaches a [`ProcessHandler`](https://github.com/consulo/consulo/blob/master/modules/base/process-api/src/main/java/consulo/process/ProcessHandler.java) to its input and output streams, creates a console to display the process output, and returns an [`ExecutionResult`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/ExecutionResult.java) object aggregating the console and the process handler.
* The [`RunContentBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/runner/RunContentBuilder.java) object is created and invoked to display the execution console in a tab of the Run or Debug tool window.

## Executor

The [`Executor`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/executor/Executor.java) interface describes a specific way of executing any possible run configuration.

The three default executors provided by the *Consulo* by default are _Run_, _Debug_, and _Run with Coverage_.  Each executor gets its own toolbar button, which starts the selected run configuration using this executor, and its own context menu item for starting a configuration using this executor.

As a plugin developer, you usually don't need to implement the `Executor` interface.
However, it can be useful, for example, if you're implementing a profiler integration and want to provide the possibility to execute any configuration with profiling.

## Running a Process

The `RunProfileState` interface comes up in every run configuration implementation as the return value `RunProfile.getState()`.
It describes a process that is ready to be started and holds information like the command line, current working directory, and environment variables for the process to be started. (The existence of `RunProfileState` as a separate step in the execution flow allows run configuration extensions and other components to patch the configuration and modify the parameters before it gets executed.)

The standard base class used as implementation of `RunProfileState` is [`CommandLineState`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/configuration/CommandLineState.java).
It contains the logic for putting together a running process and a console into an `ExecutionResult`, but doesn't know anything how the process is actually started.
For starting the process, it's best to use the [`GeneralCommandLine`](https://github.com/consulo/consulo/blob/master/modules/base/process-api/src/main/java/consulo/process/cmd/GeneralCommandLine.java) class, which takes care of setting up the command line parameters and executing the process.

Alternatively, if the process you need to run is a JVM-based one, you can use the `JavaCommandLineState` base class.
It knows about the JVM command line parameters and can take care of details like calculating the classpath for the JVM.

To monitor the execution of a process and capture its output, the [`OSProcessHandler`](https://github.com/consulo/consulo/blob/master/modules/base/process-api/src/main/java/consulo/process/internal/OSProcessHandler.java) class is usually used.
Once you've created an instance of `OSProcessHandler` from either a command line or a Process object, you need to call the `startNotify()` method to capture its output.
You may also want to attach a [`ProcessTerminatedListener`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/process/ProcessTerminatedListener.java) to the `OSProcessHandler` so that the exit status of the process will be displayed in the console.

## Displaying Process Output

If you're using `CommandLineState`, a console view will be automatically created and attached to the process's output.
Alternatively, you can arrange this yourself:

* [`TextConsoleBuilderFactory`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/ui/console/TextConsoleBuilderFactory.java)`.createBuilder(project).getConsole()` creates a [`ConsoleView`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/ui/console/ConsoleView.java) instance
* `ConsoleView.attachToProcess()` attaches it to the output of a process.

If the running process uses ANSI escape codes to color its output, the [`ColoredProcessHandler`](https://github.com/consulo/consulo/blob/master/modules/base/process-api/src/main/java/consulo/process/internal/ColoredProcessHandler.java) class will parse it and display the colors in the console.

Console `Filter` allows you to convert certain strings found in the process output to clickable hyperlinks.
To attach a filter to the console, use `CommandLineState.addConsoleFilters()` or, if you're creating a console manually, [`TextConsoleBuilder`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/ui/console/TextConsoleBuilder.java)`.addFilter()`.

Two common filter implementations you may want to reuse are [`RegexpFilter`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/ui/console/RegexpFilter.java) and [`UrlFilter`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/ui/console/UrlFilter.java).

## Starting a Run Configuration from Code

If you have an existing run configuration that you need to execute, the easiest way to do so is to use [`ProgramRunnerUtil`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/runner/ProgramRunnerUtil.java)`.executeConfiguration()`.
The method takes a `Project`, a [`RunnerAndConfigurationSettings`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/RunnerAndConfigurationSettings.java), as well as an `Executor`.
To get the `RunnerAndConfigurationSettings` for an existing configuration, you can use, for example, [`RunManager`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/RunManager.java)`.getConfigurationSettings(ConfigurationType)`.
As the last parameter, you normally pass either [`DefaultRunExecutor`](https://github.com/consulo/consulo/blob/master/modules/base/execution-api/src/main/java/consulo/execution/executor/DefaultRunExecutor.java)`.getRunExecutorInstance()` or [`DefaultDebugExecutor`](https://github.com/consulo/consulo/blob/master/modules/base/execution-debug-api/src/main/java/consulo/execution/debug/DefaultDebugExecutor.java)`.getDebugExecutorInstance()`.
