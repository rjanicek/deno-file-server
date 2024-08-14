# Deno File Server
A simple file server based on the standard Deno file server but with some extra features.

![image](https://github.com/user-attachments/assets/9f677624-034d-4d31-a596-8e715eb864bd)

![image](https://github.com/user-attachments/assets/81ec37f9-4aea-4299-9e6e-87e11bc38695)

New feature options in `deno.json`
```
{
  "status-page-url": "/status",
  "status-refresh-seconds": 15,
  "status-rate-interval-milliseconds": 1000,
  "apply-download-attribute-to-file-links": true,
  "default-favicon-base64": "AAABAA..."
}
```

## Tasks

-[ ] Remove --allow-all permission when serving files from Windows mapped drive is fixed -> https://github.com/denoland/deno/issues/24703 

## Updating file_server.ts

* find latest version in releases -> https://github.com/denoland/std/releases
* compare to version in deno.json
* if there is a newer release
    * download http/file_server.ts
    * merge with local scripts/file_server.ts
    * update dependencies in deno.json by finding latest versions on https://jsr.io/
    * update version in deno.json

## Resources

favicon -> https://www.favicon.cc/?action=icon&file_id=843526
