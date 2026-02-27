---
title: Gists
---

<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

Gists provide a way to associate persistent data with the current content of a `VirtualFile` or `PsiFile`. They offer a simpler alternative to [file-based indexes](file_based_indexes.md) when you need efficient file-level caching of computed data that may depend on the project context.

Unlike file-based indexes, gists:
- Have a simpler lifecycle and API, but do not provide the ability to query across multiple files.
- Are project-dependent: the same file can produce different data for different projects.
- Are calculated lazily on request for specific files, rather than processing all files in advance during indexing. This can be used to speed up the indexing phase and defer logic to later stages when beneficial.

Gist data is persisted between IDE restarts and is automatically recalculated when the underlying file content changes.

## GistManager

[`GistManager`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/stub/gist/GistManager.java) is the central application-level service for creating gists. It is annotated with `@ServiceAPI(ComponentScope.APPLICATION)` and can be obtained via constructor injection.

`GistManager` provides two factory methods:

- `newVirtualFileGist()` -- creates a [`VirtualFileGist`](#virtualfilegist) that works with VFS file content.
- `newPsiFileGist()` -- creates a [`PsiFileGist`](#psifilegist) that works with PSI file content.
- `invalidateData()` -- forces all gists to be recalculated on the next request.

Both factory methods share the same set of parameters:

| Parameter | Type | Description |
|---|---|---|
| `id` | `String` | A unique identifier for this gist data. |
| `version` | `int` | Should be incremented each time the `externalizer` or `calcData` logic changes. |
| `externalizer` | `DataExternalizer<Data>` | Used to store the data to disk and retrieve it. |
| `calcData` | `BiFunction<Project, VirtualFile, Data>` (for `VirtualFileGist`) or `Function<PsiFile, Data>` (for `PsiFileGist`) | Calculates the data from the file content when needed. |

## VirtualFileGist

[`VirtualFileGist<Data>`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/stub/gist/VirtualFileGist.java) calculates data based on `VirtualFile` content. It tracks VFS content only -- unsaved or uncommitted documents have no effect on the results. Disk file changes are also not reflected until VFS refresh has detected them.

The interface provides a single method:

- `getFileData(@Nullable Project project, @Nonnull VirtualFile file)` -- returns the calculated or cached data for the given file in the given project. Pass `null` for `project` if the data is project-independent.

> **NOTE** Every call to `getFileData()` involves a disk access. Clients that access gists frequently should implement their own caching layer. The data is calculated on demand when first requested, so requesting data for many files at once can take some time on the first query. If that is unacceptable from a UX perspective, consider using a file-based index instead.

### Creating a VirtualFileGist

```java
@Inject
private GistManager myGistManager;

private final VirtualFileGist<Boolean> myGist = myGistManager.newVirtualFileGist(
    "my.plugin.hasSpecialMarker",
    1,
    new DataExternalizer<Boolean>() {
        @Override
        public void save(@Nonnull DataOutput out, Boolean value) throws IOException {
            out.writeBoolean(value);
        }

        @Override
        public Boolean read(@Nonnull DataInput in) throws IOException {
            return in.readBoolean();
        }
    },
    (project, file) -> {
        // Calculate whether the file contains a special marker
        try {
            String content = new String(file.contentsToByteArray(), file.getCharset());
            return content.contains("SPECIAL_MARKER");
        }
        catch (IOException e) {
            return false;
        }
    }
);
```

Retrieving data later:

```java
boolean hasMarker = myGist.getFileData(project, virtualFile);
```

## PsiFileGist

[`PsiFileGist<Data>`](https://github.com/consulo/consulo/blob/master/modules/base/language-api/src/main/java/consulo/language/psi/stub/gist/PsiFileGist.java) calculates data based on `PsiFile` content. The key difference from `VirtualFileGist` is that PSI content is used. If an uncommitted document is saved to disk, `PsiFileGist` will use the last committed content of the PSI file, while `VirtualFileGist` would use the saved virtual file content.

Internally, `PsiFileGist` uses `VirtualFileGist`, so it has the same performance implications.

The interface provides a single method:

- `getFileData(@Nonnull PsiFile file)` -- returns the calculated or cached data for the given PSI file.

### Creating a PsiFileGist

```java
@Inject
private GistManager myGistManager;

private final PsiFileGist<Integer> myPsiGist = myGistManager.newPsiFileGist(
    "my.plugin.todoCount",
    1,
    new DataExternalizer<Integer>() {
        @Override
        public void save(@Nonnull DataOutput out, Integer value) throws IOException {
            out.writeInt(value);
        }

        @Override
        public Integer read(@Nonnull DataInput in) throws IOException {
            return in.readInt();
        }
    },
    psiFile -> {
        // Count the number of TODO comments in the PSI tree
        int count = 0;
        for (PsiComment comment : PsiTreeUtil.findChildrenOfType(psiFile, PsiComment.class)) {
            if (comment.getText().contains("TODO")) {
                count++;
            }
        }
        return count;
    }
);
```

Retrieving data later:

```java
int todoCount = myPsiGist.getFileData(psiFile);
```

## Choosing Between VirtualFileGist, PsiFileGist, and File-Based Indexes

| Feature | `VirtualFileGist` | `PsiFileGist` | File-Based Index |
|---|---|---|---|
| **Content source** | VFS file content on disk | PSI tree (committed content) | VFS file content |
| **Project-dependent** | Yes (project passed to calculator) | No (project determined by PSI file) | No |
| **Uncommitted document changes** | Not reflected | Reflected (uses last committed PSI) | Not reflected |
| **Calculation timing** | Lazy, on first request | Lazy, on first request | Eager, during indexing phase |
| **Cross-file queries** | Not supported | Not supported | Supported |
| **Disk access per query** | Yes | Yes (uses VirtualFileGist internally) | No (in-memory after indexing) |

**Use `VirtualFileGist`** when you need project-dependent data computed from raw file content and only access it for specific files (not in bulk).

**Use `PsiFileGist`** when you need data that reflects uncommitted document changes, or when your calculation logic naturally works with the PSI tree.

**Use a file-based index** when you need to query data across multiple files (e.g., finding all files that contain a certain key), or when the data should be pre-computed during the indexing phase for fast access.
