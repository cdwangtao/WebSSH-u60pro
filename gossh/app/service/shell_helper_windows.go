//go:build windows
// +build windows

package service

import "os/exec"

func MaybeExecShellHelper() {
}

func newShellCommand(shell string, args ...string) *exec.Cmd {
	return exec.Command(shell, args...)
}
