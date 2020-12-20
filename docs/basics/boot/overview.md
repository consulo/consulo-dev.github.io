# Consulo Boot Information
 * [Boot Directories](boot.directories.md) - Paths to system directories


# Major boot changes

Consulo consists of two parts:
  * **boot part** (not updatable)
      * .exe files on windows
      * macOS launcher
      * sh script on linux
  * **platform part** (updatable)

Sometimes (not often) major issues reported, which **required changes in boot part**. For update boot part - need only re-download Consulo, and replace it by **new build**.

All settings will be not changed.

List of major boot issues:
* [Platform not updated without admin rights, when Consulo placed under Program Files directory](https://github.com/consulo/consulo/issues/280)
* [After update consulo can't start happen second time](https://github.com/consulo/consulo/issues/256)
