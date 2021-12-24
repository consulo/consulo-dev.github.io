---
title: Image Library
---

# File Tree

> icon

> icon/marker.txt

> icon/_light/

> icon/_light/consulo.plugin.PluginIconGroup/

> icon/_dark/

> icon/_dark/consulo.plugin.PluginIconGroup/

# Tree info

 * **marker.txt** just marker - file must exists (text ignored)
 * _light / _dark - is **id** for Image Library. **_light** and **_dark** is bundled image libraries
 * **consulo.plugin.PluginIconGroup** - icon group. Directory must endsWith *IconGroup*


# Require maven plugin and configuration

```xml
<build>
		<plugins>
			<plugin>
				<groupId>consulo.maven</groupId>
				<artifactId>maven-consulo-plugin</artifactId>
				<version>2-SNAPSHOT</version>
				<extensions>true</extensions>
				<executions>
					<execution>
						<id>gen</id>
						<phase>generate-sources</phase>
						<goals>
							<goal>generate-icon</goal>
						</goals>
					</execution>
				</executions>
			</plugin>
		</plugins>
	</build>
```