# PyTorch Patterns

## Purpose
Enforce robust, reproducible, and efficient PyTorch deep learning pipelines.

## Apply when
Writing or optimizing PyTorch models, training loops, or data loaders.

## Rules
- **Device-Agnostic**: Always use `.to(device)`. Never hardcode `.cuda()`.
- **Reproducibility**: Explicitly set seeds for `torch`, `numpy`, `random`. Set `cudnn.deterministic = True`.
- **Shapes**: Explicitly document tensor transformations using inline shape comments in `forward()` passes.
- **Training**: Always use `model.train()` or `model.eval()`. Clear gradients with `optimizer.zero_grad(set_to_none=True)`.
- **Validation**: Decorate with `@torch.no_grad()` to disable autograd.
- **Performance**: 
  - Use `torch.amp.autocast` for mixed precision.
  - DataLoader: Use `num_workers > 0`, `pin_memory=True`, and `persistent_workers=True`.
  - Compile: Use `torch.compile(model)` for PyTorch 2.0+ speedups.
- **Checkpointing**: Save dicts containing `model.state_dict()`, `optimizer.state_dict()`, and `epoch`. Load with `weights_only=True`.

## Avoid
- Using `.item()` before calling `.backward()` (breaks the computation graph).
- Using in-place operations (`+=`, `relu_`) as they can break autograd.
- Saving the entire model object (always save `state_dict`).
- Forgetting `model.eval()` during validation (causes Dropout/BatchNorm issues).
