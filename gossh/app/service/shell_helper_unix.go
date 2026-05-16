//go:build !windows
// +build !windows

package service

import (
	"fmt"
	"os"
	"os/exec"
	"syscall"
)

const shellHelperArg = "__gossh_exec_shell"

func MaybeExecShellHelper() {
	if len(os.Args) < 3 || os.Args[1] != shellHelperArg {
		return
	}

	resetShellSignals()

	shell := os.Args[2]
	args := append([]string{shell}, os.Args[3:]...)
	if err := syscall.Exec(shell, args, os.Environ()); err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "exec shell failed: %v\n", err)
		os.Exit(127)
	}
}

func newShellCommand(shell string, args ...string) *exec.Cmd {
	exe, err := os.Executable()
	if err != nil {
		return exec.Command(shell, args...)
	}

	helperArgs := append([]string{shellHelperArg, shell}, args...)
	return exec.Command(exe, helperArgs...)
}
