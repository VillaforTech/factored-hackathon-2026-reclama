# Dependency attribution

The lockfile contains **894 package entries**, all with license declarations. 689 are installed in this Mac checkout. The inventory includes optional platform packages and dev tools, so its count is not the number of packages in the browser bundle. Declared licenses: `{'MIT': 744, 'MIT OR Apache-2.0': 4, 'Apache-2.0': 45, 'Apache-2.0 AND LGPL-3.0-or-later AND MIT': 2, 'LGPL-3.0-or-later': 10, 'Apache-2.0 AND LGPL-3.0-or-later': 3, 'MPL-2.0': 28, 'CC0-1.0': 2, '0BSD': 2, 'BlueOak-1.0.0': 1, 'ISC': 33, 'BSD-3-Clause': 6, 'Python-2.0': 1, 'CC-BY-4.0': 1, 'BSD-2-Clause': 11, 'MIT AND ISC': 1}`.

`THIRD_PARTY_NOTICES.txt` retains 636 actual license/notice files from installed package roots, grouped by exact package/version. Packages not installed here have no copied license text. Metadata and collected notices are an attribution inventory, not a legal opinion or assertion that every transitive distribution condition has been adjudicated.

No dependency binaries, `node_modules`, private data or font files are redistributed in the review ZIP. A clean install obtains packages through the lockfile and retains their original notices. Source-side library imports remain subject to each package's terms. Platform-specific optional binaries, including image tooling, may carry different licenses; consult their original packages before redistributing built tooling separately.

The team has not selected a root project license. Making a GitHub repository public does not by itself select an open-source license. This preparation does not license other contributors' work on their behalf. Choosing project reuse terms is an owner/team decision, not an extra official hackathon requirement.
