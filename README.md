## Overview

TurboWarp GUI modified for use in [NitroBolt](https://nitrobolt.org/).

## Setup

This repository uses Node.js and pnpm. Note that versions of pnpm v11.0.0 and up are not compatible with this project.

See [dev-scripts](https://github.com/Nitro-Bolt/dev-scripts) for information on how to set up a complete NitroBolt environment.

If you just want to play with the GUI:

```sh
git clone https://github.com/Nitro-Bolt/scratch-gui.git
cd scratch-gui
pnpm install --frozen-lockfile
```

Start the dev server with the `pnpm start` command.

## License

NitroBolt and TurboWarp are licensed under the GNU General Public License v3.0. See [LICENSE](./LICENSE) or https://www.gnu.org/licenses/ for details.

The following is the original license for [@scratchfoundation/scratch-gui](https://github.com/scratchfoundation/scratch-gui), which we are required to retain. This is not the license of this project.

```
Copyright (c) 2016, Massachusetts Institute of Technology
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```
