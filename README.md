# Deno File Server
A simple file server based on the standard Deno file server but with some extra features.

## Tasks

-[ ] Remove --allow-all permission when serving files from Windows mapped drive is fixed -> https://github.com/denoland/deno/issues/24703 

## Updating file_server.ts

* find latest version in releases -> https://github.com/denoland/std/releases
* compare to version in deno.json
* if there is a newer release
    * download http/file_server.ts
    * merge with local scripts/file_server.ts
    * update version in deno.json