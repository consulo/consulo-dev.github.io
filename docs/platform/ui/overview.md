# Consulo Unified UI

Consulo provides a unified UI API — implementations work across Desktop and Web browsers.

There are three backends:
* **Swing** — primary desktop implementation
* **SWT** — alternative desktop implementation _(experimental)_
* **Vaadin Flow** — web implementation _(experimental)_

By default, plugins don't need to know about **Swing**, **SWT**, or **Vaadin Flow** — they use the unified UI API

Classes:

 * [`consulo.ui.UIAccess`](https://github.com/consulo/consulo/blob/master/modules/base/ui-api/src/main/java/consulo/ui/UIAccess.java) - class provide access to UI Thread, and allow get current thread status
   * ```#isUIThread()``` - will return true if we inside UI Thread
   * ```#give(Runnable)``` - run task inside UI Thread
   * ```#current()``` - will return UIAccess instance if call inside UI thread, otherwise throw exception
