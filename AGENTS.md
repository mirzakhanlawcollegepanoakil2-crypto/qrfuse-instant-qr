<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Dedicated static QR pages reuse `QrTypeLanding` and the existing `QrGenerator`; keep tool discovery in `QR_TOOLS` so no alternate QR engine or form implementation drifts from the main generator.
- Keep `/vcard-qr-code-generator` as a permanent redirect to `/contact-qr-code-generator` to preserve existing links without duplicate indexed contact content.
