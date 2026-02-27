import {defineConfig, type DefaultTheme} from 'vitepress'

export default defineConfig({
    title: 'consulo.dev',
    description: 'Consulo Plugin Development Documentation',
    cleanUrls: true,
    sitemap: {
        hostname: 'https://consulo.dev'
    },

    ignoreDeadLinks: [
        /\/appendix\//,
        /\/products\//,
        /\/CODE_OF_CONDUCT/,
        /\/CONTRIBUTING/,
        /\/tutorials\/live_templates\/index/,
        /\/reference_guide\/ui_themes\//,
        /\/basics\/testing_plugins\//,
    ],

    head: [
        ['link', {rel: 'icon', href: '/art/icon16.svg', type: 'image/svg+xml'}]
    ],

    themeConfig: {
        logo: '/art/icon16.svg',


        nav: [
            {text: 'Home', link: '/'},
            {text: 'Architecture', link: '/platform/fundamentals'},
            {text: 'Creating Own Plugin', link: '/basics/basics'}
        ],

        sidebar: {
            // === HOME ===
            '/organization/': homeSidebar(),

            // === ARCHITECTURE section ===
            // Fundamentals
            '/platform/': architectureSidebar(),
            '/basics/architectural_overview/': architectureSidebar(),
            '/basics/boot/': architectureSidebar(),
            '/basics/ide_infrastructure/': architectureSidebar(),
            '/basics/disposers': architectureSidebar(),
            '/basics/action_system': architectureSidebar(),
            '/basics/persistence': architectureSidebar(),
            '/basics/persisting_state_of_components': architectureSidebar(),
            '/basics/persisting_sensitive_data': architectureSidebar(),
            '/basics/project_structure': architectureSidebar(),
            '/basics/settings': architectureSidebar(),
            '/basics/virtual_file_system': architectureSidebar(),
            '/basics/psi_cookbook': architectureSidebar(),
            '/basics/indexing_and_psi_stubs': architectureSidebar(),
            '/basics/run_configurations': architectureSidebar(),
            '/reference_guide/messaging_infrastructure': architectureSidebar(),
            '/reference_guide/editors': architectureSidebar(),
            '/reference_guide/multiple_carets': architectureSidebar(),
            '/reference_guide/project_model/': architectureSidebar(),
            '/reference_guide/settings_guide': architectureSidebar(),
            '/reference_guide/settings_groups': architectureSidebar(),
            '/reference_guide/vcs_integration_for_plugins': architectureSidebar(),
            '/reference_guide/work_with_icons_and_images': architectureSidebar(),
            '/reference_guide/color_scheme_management': architectureSidebar(),
            '/reference_guide/frameworks_and_external_apis/': architectureSidebar(),
            '/tutorials/action_system': architectureSidebar(),
            '/tutorials/editor_basics': architectureSidebar(),
            '/tutorials/settings_tutorial': architectureSidebar(),
            '/tutorials/run_configurations': architectureSidebar(),
            '/user_interface_components/': architectureSidebar(),

            // === CREATING OWN PLUGIN section ===
            '/basics/basics': pluginSidebar(),
            '/basics/plugin_structure/': pluginSidebar(),
            '/basics/types_of_plugins': pluginSidebar(),
            '/basics/editing': pluginSidebar(),
            '/basics/templates': pluginSidebar(),
            '/basics/project_view': pluginSidebar(),
            '/reference_guide/custom_language_support': pluginSidebar(),
            '/reference_guide/file_templates': pluginSidebar(),
            '/reference_guide/performance/': pluginSidebar(),
            '/tutorials/custom_language_support': pluginSidebar(),
            '/tutorials/custom_language_support_tutorial': pluginSidebar(),
            '/tutorials/live_templates': pluginSidebar(),
            '/tutorials/tree_structure_view': pluginSidebar(),
            '/tutorials/code_intentions': pluginSidebar(),
        },

        outline: {
            level: [2, 3]
        },

        search: {
            provider: 'local'
        }
    }
})

function homeSidebar(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: 'Home',
            items: [
                {text: 'Welcome', link: '/'},
                {
                    text: 'Organization',
                    collapsed: false,
                    items: [
                        {text: 'Overview', link: '/organization/overview'},
                        {text: 'Repositories', link: '/organization/repository_list'}
                    ]
                }
            ]
        }
    ]
}

function architectureSidebar(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: 'Fundamentals',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/platform/fundamentals'},
                {text: 'Disposer and Disposable', link: '/basics/disposers'},
                {
                    text: 'Threading',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/basics/architectural_overview/general_threading_rules'},
                        {text: 'Background Tasks', link: '/basics/architectural_overview/background_tasks'}
                    ]
                },
                {text: 'Messaging Infrastructure', link: '/reference_guide/messaging_infrastructure'},
                {text: 'Logging', link: '/basics/ide_infrastructure/logging'},
                {
                    text: 'Boot Information',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/basics/boot/overview'},
                        {text: 'Boot Directories', link: '/basics/boot/boot.directories'}
                    ]
                },
                {text: 'Code Restriction', link: '/platform/restriction'},
                {text: 'Permissions', link: '/platform/permissions'},
                {text: 'Migration from IntelliJ Platform to Consulo', link: '/basics/intellij.to.consulo.api'},
                {text: 'SPI Implementations', link: '/platform/desktop/spi.impl'}
            ]
        },
        {
            text: 'Actions',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/basics/action_system'},
                {
                    text: 'Actions Tutorial',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/tutorials/action_system'},
                        {text: 'Creating Actions', link: '/tutorials/action_system/working_with_custom_actions'},
                        {text: 'Grouping Actions', link: '/tutorials/action_system/grouping_action'}
                    ]
                }
            ]
        },
        {
            text: 'Persistence',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/basics/persistence'},
                {text: 'Persisting State of Components', link: '/basics/persisting_state_of_components'},
                {text: 'Persisting Sensitive Data', link: '/basics/persisting_sensitive_data'}
            ]
        },
        {
            text: 'Project Model',
            collapsed: false,
            items: [
                {text: 'Introduction', link: '/basics/project_structure'},
                {
                    text: 'Project',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/reference_guide/project_model/project'},
                        {text: 'Startup Activity', link: '/platform/project_model/project/startupactivity'}
                    ]
                },
                {text: 'Module', link: '/reference_guide/project_model/module'},
                {text: 'Module Extensions', link: '/reference_guide/project_model/module_extenions'},
                {text: 'SDK', link: '/reference_guide/project_model/sdk'},
                {text: 'Library', link: '/reference_guide/project_model/library'},
                {text: 'External System Integration', link: '/reference_guide/frameworks_and_external_apis/external_system_integration'}
            ]
        },
        {
            text: 'Settings',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/basics/settings'},
                {text: 'Settings Guide', link: '/reference_guide/settings_guide'},
                {text: 'Custom Groups', link: '/reference_guide/settings_groups'},
                {text: 'Settings Tutorial', link: '/tutorials/settings_tutorial'}
            ]
        },
        {
            text: 'Files',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/basics/architectural_overview/files'},
                {text: 'Virtual File System', link: '/basics/virtual_file_system'},
                {text: 'Virtual Files', link: '/basics/architectural_overview/virtual_file'}
            ]
        },
        {text: 'Documents', link: '/basics/architectural_overview/documents'},
        {
            text: 'Editors',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/reference_guide/editors'},
                {
                    text: 'Editor Basics',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/tutorials/editor_basics'},
                        {text: '1. Working with Text', link: '/tutorials/editor_basics/working_with_text'},
                        {text: '2. Editor Coordinates System', link: '/tutorials/editor_basics/coordinates_system'},
                        {text: '3. Handling Editor Events', link: '/tutorials/editor_basics/editor_events'}
                    ]
                },
                {text: 'Multiple Carets', link: '/reference_guide/multiple_carets'}
            ]
        },
        {
            text: 'PSI',
            collapsed: false,
            items: [
                {text: 'What Is the PSI?', link: '/basics/architectural_overview/psi'},
                {text: 'PSI Files', link: '/basics/architectural_overview/psi_files'},
                {text: 'File View Providers', link: '/basics/architectural_overview/file_view_providers'},
                {text: 'PSI Elements', link: '/basics/architectural_overview/psi_elements'},
                {text: 'Navigating the PSI', link: '/basics/architectural_overview/navigating_psi'},
                {text: 'References', link: '/basics/architectural_overview/psi_references'},
                {text: 'Modifying the PSI', link: '/basics/architectural_overview/modifying_psi'},
                {text: 'PSI Cookbook', link: '/basics/psi_cookbook'},
                {
                    text: 'Indexing and PSI Stubs',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/basics/indexing_and_psi_stubs'},
                        {text: 'File-Based Indexes', link: '/basics/indexing_and_psi_stubs/file_based_indexes'},
                        {text: 'Stub Indexes', link: '/basics/indexing_and_psi_stubs/stub_indexes'},
                        {text: 'Dumb Mode', link: '/basics/indexing_and_psi_stubs/dumb_mode'},
                        {text: 'Gists', link: '/basics/indexing_and_psi_stubs/gists'}
                    ]
                },
                {text: 'XML DOM API', link: '/reference_guide/frameworks_and_external_apis/xml_dom_api'}
            ]
        },
        {
            text: 'Run Configurations',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/basics/run_configurations'},
                {text: 'Run Configuration Management', link: '/basics/run_configurations/run_configuration_management'},
                {text: 'Execution', link: '/basics/run_configurations/run_configuration_execution'},
                {text: 'Run Configurations Tutorial', link: '/tutorials/run_configurations'}
            ]
        },
        {
            text: 'Version Control Systems',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/reference_guide/vcs_integration_for_plugins'}
            ]
        },
        {
            text: 'User Interface',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/platform/ui/overview'},
                {text: 'Localization', link: '/platform/ui/localization'},
                {text: 'Image Library', link: '/platform/ui/image'},
                {text: 'Tool Windows', link: '/user_interface_components/tool_windows'},
                {text: 'Popups', link: '/user_interface_components/popups'},
                {text: 'Notifications', link: '/user_interface_components/notifications'},
                {text: 'File and Class Choosers', link: '/user_interface_components/file_and_class_choosers'},
                {text: 'Editor Components', link: '/user_interface_components/editor_components'},
                {text: 'List and Tree Controls', link: '/user_interface_components/lists_and_trees'},
                {text: 'Status Bar Widgets', link: '/user_interface_components/status_bar_widgets'},
                {text: 'Icons and Images', link: '/reference_guide/work_with_icons_and_images'},
                {text: 'Color Scheme Management', link: '/reference_guide/color_scheme_management'},
                {
                    text: 'Swing (Desktop Only)',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/user_interface_components/user_interface_components'},
                        {text: 'Dialogs', link: '/user_interface_components/dialog_wrapper'},
                        {text: 'Miscellaneous Swing Components', link: '/user_interface_components/misc_swing_components'}
                    ]
                }
            ]
        },
        {text: 'Update Channels', link: '/platform/update_channels'},
        {text: 'Internal Libraries', link: '/platform/internal_libraries'}
    ]
}

function pluginSidebar(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: 'Quick Start Guide',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/basics/basics'},
                {
                    text: 'Plugin Structure',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/basics/plugin_structure'},
                        {text: 'Configuration File', link: '/basics/plugin_structure/plugin_configuration_file'},
                        {text: 'Content', link: '/basics/plugin_structure/plugin_content'},
                        {text: 'Dependencies', link: '/basics/plugin_structure/plugin_dependencies'},
                        {text: 'Extension Points', link: '/basics/plugin_structure/plugin_extension_points'},
                        {text: 'Extensions', link: '/basics/plugin_structure/plugin_extensions'},
                        {text: 'Actions', link: '/basics/plugin_structure/plugin_actions'},
                        {text: 'ClassLoaders', link: '/basics/plugin_structure/plugin_class_loaders'},
                        {text: 'Components', link: '/basics/plugin_structure/plugin_components'},
                        {text: 'Services', link: '/basics/plugin_structure/plugin_services'},
                        {text: 'Listeners', link: '/basics/plugin_structure/plugin_listeners'},
                        {text: 'Icon File', link: '/basics/plugin_structure/plugin_icon_file'}
                    ]
                },
                {text: 'Main Types of Plugins', link: '/basics/types_of_plugins'}
            ]
        },
        {
            text: 'Custom Language Support',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/reference_guide/custom_language_support'},
                {text: 'Registering File Type', link: '/reference_guide/custom_language_support/registering_file_type'},
                {text: 'Implementing Lexer', link: '/reference_guide/custom_language_support/implementing_lexer'},
                {text: 'Implementing Parser and PSI', link: '/reference_guide/custom_language_support/implementing_parser_and_psi'},
                {text: 'Syntax Highlighting and Error Highlighting', link: '/reference_guide/custom_language_support/syntax_highlighting_and_error_highlighting'},
                {text: 'References and Resolve', link: '/reference_guide/custom_language_support/references_and_resolve'},
                {text: 'Navigation', link: '/reference_guide/custom_language_support/navigation'},
                {text: 'Code Completion', link: '/reference_guide/custom_language_support/code_completion'},
                {text: 'Find Usages', link: '/reference_guide/custom_language_support/find_usages'},
                {text: 'Rename Refactoring', link: '/reference_guide/custom_language_support/rename_refactoring'},
                {text: 'Safe Delete Refactoring', link: '/reference_guide/custom_language_support/safe_delete_refactoring'},
                {text: 'Code Formatter', link: '/reference_guide/custom_language_support/code_formatting'},
                {text: 'Code Inspections and Intentions', link: '/reference_guide/custom_language_support/code_inspections_and_intentions'},
                {text: 'Structure View', link: '/reference_guide/custom_language_support/structure_view'},
                {text: 'Surround With', link: '/reference_guide/custom_language_support/surround_with'},
                {text: 'Go to Class and Go to Symbol', link: '/reference_guide/custom_language_support/go_to_class_and_go_to_symbol'},
                {text: 'Documentation', link: '/reference_guide/custom_language_support/documentation'},
                {text: 'Parameter Info', link: '/reference_guide/custom_language_support/parameter_info'},
                {text: 'Inlay Hints', link: '/reference_guide/custom_language_support/inlay_hints'},
                {text: 'Code Hierarchy', link: '/reference_guide/custom_language_support/code_hierarchy'},
                {text: 'Spell Checking', link: '/reference_guide/custom_language_support/spell_checking'},
                {text: 'Postfix Completion', link: '/reference_guide/custom_language_support/postfix_completion'},
                {text: 'Navigation Bar', link: '/reference_guide/custom_language_support/navigation_bar'},
                {text: 'Additional Minor Features', link: '/reference_guide/custom_language_support/additional_minor_features'},
                {
                    text: 'Editing',
                    collapsed: true,
                    items: [
                        {text: 'Overview', link: '/basics/editing'},
                        {
                            text: 'Templates',
                            collapsed: true,
                            items: [
                                {text: 'Overview', link: '/basics/templates'},
                                {
                                    text: 'Live Templates',
                                    collapsed: true,
                                    items: [
                                        {text: 'Overview', link: '/tutorials/live_templates'},
                                        {text: 'Adding Live Templates to a Plugin', link: '/tutorials/live_templates/template_support'},
                                        {text: 'Creating New Functions for Live Templates', link: '/tutorials/live_templates/new_macros'}
                                    ]
                                },
                                {text: 'File Templates', link: '/reference_guide/file_templates'}
                            ]
                        },
                        {text: 'Intentions', link: '/tutorials/code_intentions'}
                    ]
                }
            ]
        },
        {
            text: 'Project View',
            collapsed: false,
            items: [
                {text: 'Overview', link: '/basics/project_view'},
                {text: 'Modifying Project View Structure', link: '/tutorials/tree_structure_view'}
            ]
        },
        {
            text: 'Custom Language Support Tutorial',
            collapsed: false,
            items: [
                {text: 'Index', link: '/tutorials/custom_language_support_tutorial'},
                {text: '1. Prerequisites', link: '/tutorials/custom_language_support/prerequisites'},
                {text: '2. Language and File Type', link: '/tutorials/custom_language_support/language_and_filetype'},
                {text: '3. Grammar and Parser', link: '/tutorials/custom_language_support/grammar_and_parser'},
                {text: '4. Lexer and Parser Definition', link: '/tutorials/custom_language_support/lexer_and_parser_definition'},
                {text: '5. Syntax Highlighter and Color Settings Page', link: '/tutorials/custom_language_support/syntax_highlighter_and_color_settings_page'},
                {text: '6. PSI Helpers and Utilities', link: '/tutorials/custom_language_support/psi_helper_and_utilities'},
                {text: '7. Annotator', link: '/tutorials/custom_language_support/annotator'},
                {text: '8. Line Marker Provider', link: '/tutorials/custom_language_support/line_marker_provider'},
                {text: '9. Completion Contributor', link: '/tutorials/custom_language_support/completion_contributor'},
                {text: '10. Reference Contributor', link: '/tutorials/custom_language_support/reference_contributor'},
                {text: '11. Find Usages Provider', link: '/tutorials/custom_language_support/find_usages_provider'},
                {text: '12. Folding Builder', link: '/tutorials/custom_language_support/folding_builder'},
                {text: '13. Go To Symbol Contributor', link: '/tutorials/custom_language_support/go_to_symbol_contributor'},
                {text: '14. Structure View Factory', link: '/tutorials/custom_language_support/structure_view_factory'},
                {text: '15. Formatter', link: '/tutorials/custom_language_support/formatter'},
                {text: '16. Code Style Settings', link: '/tutorials/custom_language_support/code_style_settings'},
                {text: '17. Commenter', link: '/tutorials/custom_language_support/commenter'},
                {text: '18. Quick Fix', link: '/tutorials/custom_language_support/quick_fix'}
            ]
        }
    ]
}
