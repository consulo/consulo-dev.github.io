# Consulo Unified UI

Consulo provide UI API - implementation will be work at Desktop & Web Browsers.

Desktop implementation based on **Swing**, and Web on **GWT** (with **Vaadin** as transport + ui system)

For default - any plugins don't known about **Swing** or **GWT**

Classes:

 * ```consulo.ui.UIAccess``` - class provide access to UI Thread, and allow get current thread status
   * ```#isUIThread()``` - will return true if we inside UI Thread
   * ```#give(Runnable)``` - run task inside UI Thread
   * ```#get()``` - will return UIAccess instance if call inside UI thread, otherwise throw exception
