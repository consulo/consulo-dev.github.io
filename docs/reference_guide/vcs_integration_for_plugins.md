---
title: Version Control Systems
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

This page gives an overview of the Version Control Integration API.

## Key Concepts

### FilePath

A `FilePath` represents a path to a file or directory on disk or in the VCS repository.
Unlike a [`VirtualFile`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/VirtualFile.java), a `FilePath` can represent a path to a file which doesn't exist on disk.
The main difference between a `FilePath` and a [`java.io.File`](https://docs.oracle.com/javase/8/docs/api/java/io/File.html) is that a `FilePath` caches the `VirtualFile` corresponding to the path, so it can be retrieved without doing a VFS search.

To create instances of `FilePath`, the `VcsContextFactory` API is used.
It can be accessed as`PeerFactory.getInstance().getVcsContextFactory()`

`FilePath` representing paths in a VCS repository, rather than local paths, are created using `VcsContextFactory.createFilePathOnNonLocal()`.
The [`FilePath.isNonLocal()`](https://github.com/consulo/consulo/blob/master/modules/base/version-control-system-api/src/main/java/consulo/versionControlSystem/FilePath.java) method returns `true` for such files.

### Revision Number

A `VcsRevisionNumber` represents a revision number of the file.
If the VCS stores revision numbers as simple integers, the standard `VcsRevisionNumber` `Int` implementation can be used.
If the VCS has a more complex format of revision numbers (like CVS, which uses a series of numbers delimited with dots), the plugin can provide a custom implementation.

### ContentRevision

A `ContentRevision` represents a particular revision of a file, which exists either locally or in a VCS repository.
It has three main attributes:

* `FilePath` specifying the file of which this is a revision.
  If some version of the file exists locally, this should be a local path.
* `VcsRevisionNumber` specifying the revision number of the revision, or `VcsRevisionNumber.NULL` if the revision exists only locally.
* Content of the revision.

The content is returned as string, and the VCS plugin is responsible for converting the binary file content to correct encoding.
To detect the encoding automatically based on the IDE settings and the byte order mark, the method `CharsetToolkit.bytesToString()` can be used.
Revisions of binary files can also be represented as BinaryContentRevision, which is a subclass of ContentRevision.
For binary revisions, the result of getContent() is undefined, and getBinaryContent() can be used to retrieve the contents as a byte array.

A useful class which can be used to represent the current on-disk version of a particular file is `CurrentContentRevision`.

### FileStatus

A `FileStatus` represents a status of a file in regard to VCS (unversioned, not changed, added, modified and so on).
It determines the color used to render the name of the file in the UI.

### Change

A `Change` represents a single file operation (creation, modification, move/rename or deletion) from a VCS point of view.
A Change can represent either a modification which the user has performed locally and not yet committed, a committed modification, or some other type of modification (for example, a shelved change or a difference between two arbitrary revisions).

A `Change` essentially consists of two content revisions:

* before revision (`null` if the *Change* represents file creation)
* after revision (`null` if the *Change* represents file deletion)

A move or rename is represented by a Change where the before revision and the after revision have different file paths.
A custom file status can be specified for a `Change` if it represents a non-standard modification of the file (for example, a file which has been merged with conflicts).
If a custom file status has not been specified, the status is calculated automatically from the change type.

### ChangeList

A `ChangeList` represents a named group of related changes.
There are two main kinds of changelists:

* `LocalChangeList` represents a group of modifications done by a user locally.
  If the VCS also supports the concept of changelists (like Perforce does), the VCS plugin can synchronize Consulo's local changelist structure with that of the VCS.
  Otherwise, a local changelist is simply a subset of the files checked out or modified by the user.
* `CommittedChangeList` represents a set of modifications checked in to the VCS repository.
  For VCSes which support atomic commit, every committed revision is represented by a CommittedChangeList.
  For VCSes which use per-file commit (like CVS), the plugin can use heuristics to group a sequence of individual file commits into a
  `CommittedChangeList`

> **NOTE** The *Unversioned Files*, *Locally Deleted Files*, etc., nodes in the *Changes* view are not actually change lists, and files under those nodes are not represented by `ChangeList` objects.

## Plugin Components

This section describes the different components which comprise a VCS integration plugin, roughly in the same order as they should be implemented.

### AbstractVcs

This is the main entry point for a VCS plugin, which is used by the Consulo to retrieve all other services provided by the plugin.
To register an `AbstractVcs` implementation, annotate your subclass with `@ExtensionImpl`, as shown in the following example:

```java
@ExtensionImpl
public class SvnVcs extends AbstractVcs {
    // getName() must return the unique VCS name, e.g. "svn"
    // ...
}
```

The `getName()` method of your [`AbstractVcs`](https://github.com/consulo/consulo/blob/master/modules/base/version-control-system-api/src/main/java/consulo/versionControlSystem/AbstractVcs.java) implementation must return the unique name of the VCS.

### ChangeProvider

This component is responsible for tracking user changes to the working copy, and reporting these changes to the Consulo core.
An implementation of this class is returned from [`AbstractVcs.getChangeProvider()`](https://github.com/consulo/consulo/blob/master/modules/base/version-control-system-api/src/main/java/consulo/versionControlSystem/AbstractVcs.java).

The ChangeProvider works in tandem with [`VcsDirtyScopeManager`](https://github.com/consulo/consulo/blob/master/modules/base/version-control-system-api/src/main/java/consulo/versionControlSystem/change/VcsDirtyScopeManager.java), which is a component in Consulo core. [`VcsDirtyScopeManager`](https://github.com/consulo/consulo/blob/master/modules/base/version-control-system-api/src/main/java/consulo/versionControlSystem/change/VcsDirtyScopeManager.java) keeps track of the 'dirty scope' - the set of files for which the VCS file status may be out of date.
Files are added to the dirty scope either when they are modified on disk, or when their VCS status is invalidated by an explicit call to [`VcsDirtyScopeManager.fileDirty()`](https://github.com/consulo/consulo/blob/master/modules/base/version-control-system-api/src/main/java/consulo/versionControlSystem/change/VcsDirtyScopeManager.java) or [`VcsDirtyScopeManager.dirDirtyRecursively()`](https://github.com/consulo/consulo/blob/master/modules/base/version-control-system-api/src/main/java/consulo/versionControlSystem/change/VcsDirtyScopeManager.java).

After some files have been added to the dirty scope, the dirty scope is passed to [`ChangeProvider.getChanges()`](https://github.com/consulo/consulo/blob/master/modules/base/version-control-system-api/src/main/java/consulo/versionControlSystem/change/ChangeProvider.java), along with a `ChangelistBuilder` instance, which serves as a sink to which the `ChangeProvider` feeds the data about the changed files.
This processing happens asynchronously in a background thread.

The `ChangeProvider` can either iterate all files under the dirty scope using `VcsDirtyScope.iterate()`, or retrieve information about its contents using the `getDirtyFiles()` and `getDirtyDirectoriesRecursively()` methods.
If it is possible to retrieve the information about the local changes from the VCS in batch, it's strongly preferable to use the second method, as it scales much better for large working copies.

The `ChangeProvider` reports data to ChangelistBuilder using the following methods:

* `processChange()` is called for files which have been checked out (or modified if the VCS doesn't use an explicit checkout model), scheduled for addition or deletion, moved or renamed.
* `processUnversionedFile()` is called for files which exist on disk, but are not managed by the VCS, not scheduled for addition, and not ignored through *.cvsignore* or a similar mechanism.
* `processLocallyDeletedFile()` is called for files which exist in the VCS repository, but do not exist on disk and are not scheduled for deletion.
* `processIgnoredFile()` is called for files which are not managed by the VCS but are ignored through *.cvsignore* or a similar mechanism.
* `processSwitchedFile()` is called for files or directories for which the working copy corresponds to a different branch compared to the working copy of their parent directory.
  This can be called for the same files for which processSwitchedFile() has already been called.
