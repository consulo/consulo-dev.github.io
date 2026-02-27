---
title: Settings Tutorial
---
<!-- Copyright 2000-2025 JetBrains s.r.o. and other contributors. Use of this source code is governed by the Apache 2.0 license that can be found in the LICENSE file. -->

## Introduction
As discussed in the [_Settings_ Guide](/reference_guide/settings_guide.md), plugins can add Settings to Consulo-based IDEs.
The IDE displays the Settings in response to a user choosing **Settings/Preferences**.
Custom Settings are displayed and function just like those native to the IDE.


## Overview of a Custom Settings Implementation
Using the SDK code sample `settings`, this tutorial illustrates the steps to create custom Application-level Settings.
Many Consulo Settings implementations use fewer classes, but the `settings` code sample factors the functionality into three classes for clarity:
* The `AppSettingsConfigurable` is analogous to a Controller in the MVC model - it interacts with the other two Settings classes and the Consulo,
* The `AppSettingsState` is like a Model because it stores the Settings persistently,
* The `AppSettingsComponent` is similar to a View because it displays and captures edits to the values of the Settings.

The structure of the implementation is the same for Project Settings, but there are minor differences in the [`Configurable` implementation](/reference_guide/settings_guide.md#constructors) and [Extension Point (EP) declaration](/reference_guide/settings_guide.md#declaring-project-settings).

## The AppSettingsState Class
The `AppSettingsState` class persistently stores the custom Settings.
It is based on the [Consulo Persistence Model](/basics/persisting_state_of_components.md#using-persistentstatecomponent).

### Declaring AppSettingsState
In Consulo, services are registered using annotations instead of XML.
The service interface or base class is annotated with `@ServiceAPI(ComponentScope.APPLICATION)` (or `ComponentScope.PROJECT` for project-level services), and the implementation class is annotated with `@ServiceImpl`.

For `AppSettingsState`, the `@ServiceImpl` annotation on the implementation class is sufficient to register it as an application-level service:

```java
@ServiceImpl
@State(name = "org.consulo.sdk.settings.AppSettingsState", storages = @Storage("SdkSettingsPlugin.xml"))
public class AppSettingsState implements PersistentStateComponent<AppSettingsState> {
    // ...
}
```

### Creating the AppSettingState Implementation
As discussed in [Implementing the PersistentStateComponent Interface](/basics/persisting_state_of_components.md#implementing-the-persistentstatecomponent-interface), `AppSettingsState` uses the pattern of implementing `PersistentStateComponent` itself:

```java
package org.consulo.sdk.settings;

import consulo.annotation.component.ServiceImpl;
import consulo.application.Application;
import consulo.component.persist.PersistentStateComponent;
import consulo.component.persist.State;
import consulo.component.persist.Storage;

import jakarta.annotation.Nonnull;

/**
 * Supports storing the application settings in a persistent way.
 * The {@link State} and {@link Storage} annotations define the name of the data
 * and the filename where these persistent application settings are stored.
 */
@State(
    name = "org.consulo.sdk.settings.AppSettings",
    storages = @Storage("SdkSettingsPlugin.xml")
)
@ServiceImpl
final class AppSettings
    implements PersistentStateComponent<AppSettings.State> {

  static class State {
    public String userId = "John Smith";
    public boolean ideaStatus = false;
  }

  private State myState = new State();

  static AppSettings getInstance() {
    return Application.get().getInstance(AppSettings.class);
  }

  @Override
  public State getState() {
    return myState;
  }

  @Override
  public void loadState(@Nonnull State state) {
    myState = state;
  }

}
```

#### Storage Annotation
The `@State` annotation, located just above the class declaration, [defines the data storage location](/basics/persisting_state_of_components.md#defining-the-storage-location).
For `AppSettingsState`, the data `name` parameter is the FQN of the class.
Using FQN is a best practice to follow, and is required if custom data gets stored in the standard project or workspace files.

The `storages` parameter utilizes the `@Storage` annotation to define a custom file name for the `AppSettingsState` data.
In this case, the file is located in the `options` directory of the configuration directory for the IDE.

#### Persistent Data Fields
The `AppSettingState` implementation has two public fields: a `String` and a `boolean`.
Conceptually these fields hold the name of a user, and whether that person is a Consulo user, respectively.
See [Implementing the State Class](/basics/persisting_state_of_components.md#implementing-the-state-class) for more information about how `PersistentStateComponent` serializes public fields.

#### AppSettingState Methods
The fields are so limited and straightforward for this class that encapsulation is not used for simplicity.
All that's needed for functionality is to override the two methods called by the Consulo when a new component state is loaded (`PersistentStateComponent.loadState()`), and when a state is saved (`PersistentStateComponent.getState()`).
See `PersistentStateComponent` for more information about these methods.

One static convenience method has been added - `AppSettingState.getInstance()` - which allows `AppSettingsConfigurable` to easily acquire a reference to `AppSettingState`.

## The AppSettingsComponent Class
The role of the `AppSettingsComponent` is to provide a `JPanel` for the custom Settings to the IDE Settings Dialog.
The `AppSettingsComponent` has-a `JPanel`, and is responsible for its lifetime.
The `AppSettingsComponent` is instantiated by `AppSettingsConfigurable`.

### Creating the AppSettingsComponent Implementation
The `AppSettingsComponent` defines a `JPanel` containing a `JBTextField` and a `JBCheckBox` to hold and display the data that maps to the [data fields](#persistent-data-fields) of `AppSettingsState`:

```java
package org.consulo.sdk.settings;

import consulo.ui.ex.awt.JBCheckBox;
import consulo.ui.ex.awt.JBLabel;
import consulo.ui.ex.awt.JBTextField;
import consulo.ui.ex.awt.FormBuilder;

import jakarta.annotation.Nonnull;

import javax.swing.*;

/**
 * Supports creating and managing a {@link JPanel} for the Settings Dialog.
 */
public class AppSettingsComponent {

  private final JPanel myMainPanel;
  private final JBTextField myUserNameText = new JBTextField();
  private final JBCheckBox myIdeaUserStatus = new JBCheckBox("Consulo user");

  public AppSettingsComponent() {
    myMainPanel = FormBuilder.createFormBuilder()
        .addLabeledComponent(new JBLabel("User name:"), myUserNameText, 1, false)
        .addComponent(myIdeaUserStatus, 1)
        .addComponentFillVertically(new JPanel(), 0)
        .getPanel();
  }

  public JPanel getPanel() {
    return myMainPanel;
  }

  public JComponent getPreferredFocusedComponent() {
    return myUserNameText;
  }

  @Nonnull
  public String getUserNameText() {
    return myUserNameText.getText();
  }

  public void setUserNameText(@Nonnull String newText) {
    myUserNameText.setText(newText);
  }

  public boolean getIdeaUserStatus() {
    return myIdeaUserStatus.isSelected();
  }

  public void setIdeaUserStatus(boolean newStatus) {
    myIdeaUserStatus.setSelected(newStatus);
  }

}
```

#### AppSettingsComponent Methods
The constructor builds the `JPanel` using the convenient `FormBuilder`, and saves a reference to the `JPanel`.
The rest of the class are simple accessors and mutators to encapsulate the UI components used on the `JPanel`.


## The AppSettingsConfigurable Class
The methods of `AppSettingsConfigurable` are called by the Consulo, and `AppSettingsConfigurable` in turn interacts with `AppSettingsComponent` and `AppSettingState`.

### Declaring the AppSettingsConfigurable
In Consulo, `ApplicationConfigurable` is annotated with `@ExtensionAPI(ComponentScope.APPLICATION)`, so implementations are registered using the `@ExtensionImpl` annotation instead of XML.
An explanation of this pattern can be found in [Declaring Application Settings](/reference_guide/settings_guide.md#declaring-application-settings).

The `@ExtensionImpl` annotation on the `Configurable` implementation class registers it with the platform:


### Creating the AppSettingsConfigurable Implementation
The `AppSettingsConfigurable` class implements `Configurable` interface.
The class has one field to hold a reference to the `AppSettingsComponent`.

```java
package org.consulo.sdk.settings;

import consulo.annotation.component.ExtensionImpl;
import consulo.configurable.Configurable;
import consulo.localize.LocalizeValue;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;

import javax.swing.*;
import java.util.Objects;

/**
 * Provides controller functionality for application settings.
 */
@ExtensionImpl
final class AppSettingsConfigurable implements Configurable {

  private AppSettingsComponent mySettingsComponent;

  @Nonnull
  @Override
  public String getId() {
    return "org.consulo.sdk.settings.AppSettingsConfigurable";
  }

  @Nonnull
  @Override
  public LocalizeValue getDisplayName() {
    return LocalizeValue.localizeTODO("SDK: Application Settings Example");
  }

  @Override
  public JComponent getPreferredFocusedComponent() {
    return mySettingsComponent.getPreferredFocusedComponent();
  }

  @Nullable
  @Override
  public JComponent createComponent() {
    mySettingsComponent = new AppSettingsComponent();
    return mySettingsComponent.getPanel();
  }

  @Override
  public boolean isModified() {
    AppSettings.State state =
        Objects.requireNonNull(AppSettings.getInstance().getState());
    return !mySettingsComponent.getUserNameText().equals(state.userId) ||
        mySettingsComponent.getIdeaUserStatus() != state.ideaStatus;
  }

  @Override
  public void apply() {
    AppSettings.State state =
        Objects.requireNonNull(AppSettings.getInstance().getState());
    state.userId = mySettingsComponent.getUserNameText();
    state.ideaStatus = mySettingsComponent.getIdeaUserStatus();
  }

  @Override
  public void reset() {
    AppSettings.State state =
        Objects.requireNonNull(AppSettings.getInstance().getState());
    mySettingsComponent.setUserNameText(state.userId);
    mySettingsComponent.setIdeaUserStatus(state.ideaStatus);
  }

  @Override
  public void disposeUIResources() {
    mySettingsComponent = null;
  }

}
```

#### AppSettingsConfigurable Methods
All the methods in this class are overrides of the methods in the `Configurable` interface.
Readers are encouraged to review the Javadoc comments for the `Configurable` methods.
Also review notes about [Consulo Interactions](/reference_guide/settings_guide.md#consulo-platform-interactions-with-configurable) with `Configurable` methods.

## Testing the Custom Settings Plugin
After performing the steps described above, compile and run the plugin in a Development Instance to see the custom Settings available in the Settings Dialog.
Open the IDE Settings by selecting **Settings/Preferences \| Tools \| SDK: Application Settings Example**.
The settings are preloaded with the default values:

<img src="./img/settings_defaults.png" alt=""Settings Defaults"" width="600" />

Now edit the settings values to "John Doe" and click the checkbox.
Click on the **OK** button to close the Settings dialog and save the changes.
Exit the Development Instance.

Open the file `SdkSettingsPlugin.xml` to see the Settings persistently stored.
In this demonstration the file resides in `code_samples/settings/build/idea-sandbox/config/options/`, but see [IDE Development Instances](/basics/ide_development_instance.md) for the general Development Instance case.

<img src="./img/settings_persisted.png" alt=""Persisted Settings"" width="600" />
