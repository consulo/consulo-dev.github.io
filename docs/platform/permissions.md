# Overview
For restricting illegal actions from 3rd-party plugins, permissions control some major access to system resources.

# Permission Types
  * PROCESS_CREATE - running any process in OS (and destroy if need)
  * PROCESS_MANAGE - list all processes in OS, and destroy them (protected by user space)
  * NATIVE_LIBRARY - loading native libraries in Consulo process
  * SOCKET_BIND - binding any TCP/UDP socket
  * SOCKET_CONNECT - connecting to any TCP/UDP socket
  * INTERNET - permission for control access to internet by url(http, https), by plain implementation.
  
    Warning: some clients can implement own socket handling, and they will require #SOCKET_CONNECT permission, and don't checked it by this permission