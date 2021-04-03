---
title: Localization
---

# File Tree

> localize

> localize/id.txt

> package1/

> package1/package2/

> package1/package2/package3/

> package1/package2/package3/PluginLocalize.yaml


# Text of 'id.txt' file

Default value of english localize is **en**


# Require maven plugin and configuration

```xml
<build>
		<plugins>
			<plugin>
				<groupId>consulo.maven</groupId>
				<artifactId>consulo-maven-plugin</artifactId>
				<version>2-SNAPSHOT</version>
				<extensions>true</extensions>
				<executions>
					<execution>
						<id>gen</id>
						<phase>generate-sources</phase>
						<goals>
							<goal>generate-localize</goal>
						</goals>
					</execution>
				</executions>
			</plugin>
		</plugins>
	</build>
```

# Localization plugins

Plugin must have yaml file an different locale. Like **ru**