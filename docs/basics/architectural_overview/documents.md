---
title: Documents
---

<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

A [`Document`](https://github.com/consulo/consulo/blob/master/modules/base/document-api/src/main/java/consulo/document/Document.java) is an editable sequence of Unicode characters, typically corresponding to the text contents of a [virtual file](virtual_file.md).

Line breaks in a document are _always_ normalized to `\n`.
The *Consulo* handles encoding and line break conversions when loading and saving documents transparently.

## How do I get a document?

From an action
: `e.getData(PlatformDataKeys.EDITOR).getDocument()`

From a virtual file
: [`FileDocumentManager.getDocument()`](https://github.com/consulo/consulo/blob/master/modules/base/document-api/src/main/java/consulo/document/FileDocumentManager.java). This call forces the document content to be loaded from disk if it wasn't loaded previously. If only open documents or documents which may have been modified are considered relevant, use [`FileDocumentManager.getCachedDocument()`](https://github.com/consulo/consulo/blob/master/modules/base/document-api/src/main/java/consulo/document/FileDocumentManager.java) instead.

From a PSI file
: [`PsiDocumentManager.getInstance().getDocument()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiDocumentManager.java) or [`PsiDocumentManager.getInstance().getCachedDocument()`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiDocumentManager.java)

## What can I do with a Document?

You may perform any operations that access or modify the file contents on the "plain text" level (as a sequence of characters, not as a tree of PSI elements).

## Where does a Document come from?

Document instances are created when some operation needs to access the text contents of a file (in particular, this is necessary to build the PSI for a file).
Also, document instances not linked to any virtual files can be created temporarily, for example, representing the contents of a text editor field in a dialog.

## How long does a Document persist?

Document instances are weakly referenced from [`VirtualFile`](https://github.com/consulo/consulo/blob/master/modules/base/virtual-file-system-api/src/main/java/consulo/virtualFileSystem/VirtualFile.java) instances.
Thus, an unmodified `Document` instance can be garbage-collected if no one references it, and a new instance is created if the document contents are reaccessed later.

> **WARNING** Storing `Document` references in long-term data structures of a plugin will cause memory leaks.

## How do I create a Document?

For creating a new file on disk, please do not create a `Document` but a PSI file and get its `Document`.
To create a `Document` instance that isn't bound to anything, use [`EditorFactory.createDocument()`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/EditorFactory.java).

## How do I get notified when Documents change?

* [`Document.addDocumentListener()`](https://github.com/consulo/consulo/blob/master/modules/base/document-api/src/main/java/consulo/document/Document.java) allows receiving notifications about changes in a particular `Document` instance.
* [`EditorFactory.getEventMulticaster().addDocumentListener()`](https://github.com/consulo/consulo/blob/master/modules/base/code-editor-api/src/main/java/consulo/codeEditor/EditorFactory.java) allows receiving notifications about changes in all open documents.
* Subscribe to `AppTopics.FILE_DOCUMENT_SYNC` on any level bus to receive notifications when a `Document` is saved or reloaded from disk.

## What are the rules of working with Documents?

The general read/write action rules are in effect.
Besides, any operations which modify the contents of the document must be wrapped in a command (`CommandProcessor.getInstance().executeCommand()`).
`executeCommand()` calls can be nested, and the outermost `executeCommand()` call is added to the undo stack.
If multiple documents are modified within a command, undoing this command will, by default, show a confirmation dialog to the user.

If the file corresponding to a `Document` is read-only (for example, not checked out from the version control system), document modifications will fail.
Thus, before modifying the `Document`, it is necessary to call `ReadonlyStatusHandler.getInstance(project).ensureFilesWritable()` to check out the file.

All text strings passed to `Document` modification methods (`setText()`, `insertString()`, `replaceString()`) must use only `\n` as line separators.

## Are there any utilities available for working with Documents?

`DocumentUtil` contains utility methods for `Document` processing.
This allows you to get information like the text offsets of particular lines.
This is particularly useful when you need text location/offset information about a given [`PsiElement`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/PsiElement.java).
