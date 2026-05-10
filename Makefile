PORT ?= 8000
HOST ?= 0.0.0.0
LOCAL_IP ?= $(shell ifconfig en0 2>/dev/null | awk '/inet / {print $$2; exit}')

.PHONY: serve open urls

serve:
	python3 -m http.server $(PORT) --bind $(HOST)

open:
	@printf "Local:   http://127.0.0.1:%s/\n" "$(PORT)"
	@if [ -n "$(LOCAL_IP)" ]; then \
		printf "Network: http://%s:%s/\n" "$(LOCAL_IP)" "$(PORT)"; \
	else \
		printf "Network: run ifconfig and use this Mac's Wi-Fi inet address with port %s\n" "$(PORT)"; \
	fi

urls:
	@$(MAKE) --no-print-directory open
