//go:build linux
// +build linux

package service

import (
	"syscall"
	"unsafe"

	"gossh/sys/unix"
)

type linuxSigaction struct {
	handler  uintptr
	flags    uint64
	restorer uintptr
	mask     uint64
}

func resetShellSignals() {
	for _, sig := range []syscall.Signal{
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGQUIT,
		syscall.SIGTERM,
	} {
		resetSignalDefault(sig)
	}
}

func resetSignalDefault(sig syscall.Signal) {
	var action linuxSigaction
	_, _, _ = unix.RawSyscall6(
		unix.SYS_RT_SIGACTION,
		uintptr(sig),
		uintptr(unsafe.Pointer(&action)),
		0,
		unsafe.Sizeof(action.mask),
		0,
		0,
	)
}
