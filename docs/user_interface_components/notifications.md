---
title: Notifications
---
<!-- Copyright 2000-2020 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

One of the leading design principles is avoiding the use of modal message boxes for notifying the user about errors and other situations that may warrant the user's attention. As a replacement, the *Consulo* provides multiple non-modal notification UI options.

For an overview, refer to _Consulo UI Guidelines_.

### Dialogs

When working in dialog, instead of checking the validity of the input when the _OK_ button is pressed and notifying the user about invalid data with a modal dialog, the recommended approach is to use [`DialogWrapper.doValidate()`](https://github.com/consulo/consulo/blob/master/modules/base/ui-ex-awt-api/src/main/java/consulo/ui/ex/awt/DialogWrapper.java), which was described previously.

### Editor Hints

For actions invoked from the editor (such as refactorings, navigation actions and different code insight features), the best way to notify the user about the inability to perform an action is to use the `HintManager` class. Its method `showErrorHint()` displays a floating popup above the editor which is automatically hidden when the user starts performing another action in the editor.
Other `HintManager` methods can be used for displaying other kinds of non-modal notification hints over an editor.

### Top-Level Notifications

The most general way to display non-modal notifications is to use the `Notifications` class.

It has two main advantages:

* The user can control the way each notification type is displayed under `Settings | Appearance & Behavior | Notifications`
* All displayed notifications are gathered in the Event Log tool window and can be reviewed later
         
For UI reference, see _Consulo UI Guidelines_.

The specific method used to display a notification is `Notifications.Bus.notify()`. If the current Project is known, please use overload with [`Project`](https://github.com/consulo/consulo/blob/master/modules/base/project-api/src/main/java/consulo/project/Project.java) parameter, so the notification is shown in its associated frame.

The text of the notification can include HTML tags.

Use [`Notification.addAction(AnAction)`](https://github.com/consulo/consulo/blob/master/modules/base/project-ui-api/src/main/java/consulo/project/ui/notification/Notification.java) to add links below the content, use [`NotificationAction`](https://github.com/consulo/consulo/blob/master/modules/base/project-ui-api/src/main/java/consulo/project/ui/notification/NotificationAction.java) for convenience.

The `groupId` parameter of the [`Notification`](https://github.com/consulo/consulo/blob/master/modules/base/project-ui-api/src/main/java/consulo/project/ui/notification/Notification.java) constructor specifies a notification type. The user can choose the display type corresponding to each notification type under `Settings | Appearance and Behavior | Notifications`.

To specify the preferred display type, you need to use [`NotificationGroup`](https://github.com/consulo/consulo/blob/master/modules/base/project-ui-api/src/main/java/consulo/project/ui/notification/NotificationGroup.java) to create notifications.

Please see the following two paragraphs for setup, depending on the target platform version.

##### NotificationGroup (2020.3 and later)

`NotificationGroup` is registered in `plugin.xml` using `consulo.notificationGroup` extension point. Use `key` to provide a localized group display name.

```xml
<extensions defaultExtensionNs="consulo">
  <notificationGroup id="Custom Notification Group" displayType="BALLOON" key="notification.group.name"/>
</extensions>
```

Registered instances can then be obtained via their `id`.

> **TIP** Code insight is available for parameters expecting notification group `id`.

```java
public class MyNotifier {

  public static void notifyError(@Nullable Project project, String content) {
    NotificationGroupManager.getInstance().getNotificationGroup("Custom Notification Group")
            .createNotification(content, NotificationType.ERROR)
            .notify(project);
  }

}
```

##### NotificationGroup (Pre-2020.3)

`NotificationGroup` is registered in code.

```java
public class MyNotifier {

  private static final NotificationGroup NOTIFICATION_GROUP =
          new NotificationGroup("Custom Notification Group", NotificationDisplayType.BALLOON, true);

  public static void notifyError(@Nullable Project project, String content) {
    NOTIFICATION_GROUP.createNotification(content, NotificationType.ERROR)
                      .notify(project);
  }

}
```
