//go:build !linux && !windows
// +build !linux,!windows

package service

import (
	"os/signal"
	"syscall"
)

func resetShellSignals() {
	signal.Reset(syscall.SIGHUP, syscall.SIGINT, syscall.SIGQUIT, syscall.SIGTERM)
}
