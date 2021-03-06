#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#

#
# Copyright 2016 Joyent, Inc.
#

#
# If you find yourself adding support for new targets that could be useful for
# other projects too, you should add these to the original versions of the
# included Makefiles (in eng.git) so that other teams can use them too.
#
# Note that this makefile does not contain most of the rules that other SDC
# components' do; that's because this is not an HTTP server and does not
# have its own zone.  Accordingly, there's no need for any of the prebuilt
# node nonsense, SMF manifests, or zone metadata.  This is a single, simple
# node module.
#

#
# Tools
#
TAPE  := ./node_modules/.bin/tape

#
# Files
#
DOC_FILES	 = index.md
RESTDOWN_FLAGS   = --brand-dir=deps/restdown-brand-remora
JS_FILES	:= $(shell find lib test bin -name '*.js')
JSL_CONF_NODE	 = tools/jsl.node.conf
JSL_FILES_NODE   = $(JS_FILES)
JSSTYLE_FILES	 = $(JS_FILES)
JSSTYLE_FLAGS    = -o indent=tab,doxygen,unparenthesized-return=1

NPM=npm
NODE=node
NPM_EXEC=$(shell which npm)
NODE_EXEC=$(shell which node)

include ./tools/mk/Makefile.defs

EXTRA_DOC_DEPS	+= deps/restdown-brand-remora/.git

ROOT            := $(shell pwd)

#
# Repo-specific targets
#
.PHONY: all
all: $(TAPE) $(REPO_DEPS)
	$(NPM) install

$(TAPE): | $(NPM_EXEC)
	$(NPM) install

.PHONY: test plugins_test
test: $(TAPE)
	$(TAPE) test/*.test.js test/algorithms/*.test.js

plugins_test: $(TAPE)
	$(TAPE) test/algorithms/*.test.js


include ./tools/mk/Makefile.deps
include ./tools/mk/Makefile.targ
