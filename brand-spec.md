# GitHub Repository Replica — Brand Specification

## Scope

This implementation recreates the public repository view for **fazaa092-netizen/hasoon**. It preserves the information-dense, utility-first visual language of GitHub while providing responsive layouts and functional UI states for search, branch selection, code actions, repository actions, and mobile navigation.

## Approved assets

| Asset | Local path | Use |
|---|---|---|
| Official white GitHub Invertocat | `/assets/github-invertocat-white.svg` | Global header brand mark |
| fazaa092-netizen avatar | `/assets/fazaa092-netizen-avatar.png` | Latest commit and contributor list |
| base44-builder avatar | `/assets/base44-builder-avatar.png` | Contributor list |

The GitHub logo was sourced from the official [GitHub Brand Toolkit](https://brand.github.com/foundations/logo). No effects, recoloring, stretching, or custom redraws are applied.

## Design read

The artifact is a **desktop-first repository interface** intended for close viewing on laptop and desktop screens. The visual language is GitHub's compact product UI. The work is a faithful recreation rather than a redesign: visual variance is 1/10, motion intensity is 2/10, information density is 9/10, asset dependence is 4/10, and brand fidelity is 10/10.

## Design tokens

| Decision | Value |
|---|---|
| Header | `#010409` |
| Canvas | `#FFFFFF` |
| Subtle surface | `#F6F8FA` |
| Primary text | `#1F2328` |
| Secondary text | `#656D76` |
| Border | `#D0D7DE` |
| Link | `#0969DA` |
| Success/action | `#1F883D` |
| Active tab | `#FD8C73` |
| Typeface | Native system stack matching GitHub UI |
| Spacing unit | 4 px with 8/12/16/24/32 px groupings |
| Radius | 6 px controls and panels; 8–12 px popovers |
| Shadows | Reserved for elevated menus and dialogs only |
| Motion | 120–180 ms using `cubic-bezier(0.23, 1, 0.32, 1)` |

## Responsive behavior

At tablet widths, the global navigation becomes a menu and repository controls reorganize without changing visual vocabulary. Below 860 px, the repository sidebar stacks below the file browser. Below 680 px, low-priority commit metadata and file messages are removed while names and update ages remain visible. Repository tabs remain horizontally scrollable and all principal touch targets remain at least 40 px tall.

## Interaction states

All controls expose hover, active, focus-visible, and expanded states. Search opens through both the header control and the `/` keyboard shortcut. The branch and Code menus are keyboard-dismissable with Escape. Repository Star, Notifications, Fork, code-copy, and appearance controls provide visible toast feedback. File and metadata links lead to the real public repository.
