import { NextRequest } from "next/server";
import {
  withApiHandler,
  withMethodCheck,
  createSuccessResponse,
  parseJsonBody,
  ApiErrors,
} from "@/lib/api-utils";
import { validateBody, updateTagSchema } from "@/lib/validations";
import { updateTag, deleteTag, getTagById, getTagByName } from "@/lib/tags";

// ============================================================================
// 标签单个操作 API 路由处理器
// ============================================================================
// 处理 /api/tags/[id] 路由的 PUT 和 DELETE 请求
// PUT: 更新标签（管理员功能）
// DELETE: 删除标签（管理员功能）
// ============================================================================

/**
 * PUT /api/tags/[id] - 更新标签
 */
async function handleUpdateTag(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. 验证标签是否存在
  const existingTag = await getTagById(id);
  if (!existingTag) {
    throw ApiErrors.notFound(`标签不存在: ${id}`);
  }

  // 2. 解析和验证请求体
  const body = await parseJsonBody(req);
  const validatedData = validateBody(updateTagSchema, body);

  const { name } = validatedData;

  // 3. 如果更新名称，检查是否与其他标签重复
  if (name && name !== existingTag.name) {
    const existingTagByName = await getTagByName(name);
    if (existingTagByName && existingTagByName.id !== id) {
      throw ApiErrors.conflict(`标签名称 "${name}" 已存在，请使用其他名称`);
    }
  }

  // 4. 更新标签
  const updatedTag = await updateTag(id, validatedData);

  // 5. 记录操作日志
  console.log(`标签更新成功: ${updatedTag.id} - ${updatedTag.name}`);

  // 6. 返回成功响应
  return createSuccessResponse(updatedTag, "标签更新成功");
}

/**
 * DELETE /api/tags/[id] - 删除标签
 */
async function handleDeleteTag(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. 验证标签是否存在
  const existingTag = await getTagById(id);
  if (!existingTag) {
    throw ApiErrors.notFound(`标签不存在: ${id}`);
  }

  // 2. 检查标签是否被文章使用
  // TODO: 可以在这里添加检查，防止删除正在使用的标签
  // 或者在删除标签时同时删除关联关系

  // 3. 删除标签
  await deleteTag(id);

  // 4. 记录操作日志
  console.log(`标签删除成功: ${id} - ${existingTag.name}`);

  // 5. 返回成功响应
  return createSuccessResponse({ id, name: existingTag.name }, "标签删除成功");
}

// ============================================================================
// 导出的路由处理器
// ============================================================================

/**
 * PUT 请求处理器 - 更新标签
 */
export const PUT = withApiHandler(withMethodCheck(["PUT"])(handleUpdateTag));

/**
 * DELETE 请求处理器 - 删除标签
 */
export const DELETE = withApiHandler(
  withMethodCheck(["DELETE"])(handleDeleteTag)
);

// ============================================================================
// 类型定义和接口文档
// ============================================================================

/**
 * API 接口文档注释
 *
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: 更新标签
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 标签ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 标签名称
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 description: 标签颜色（十六进制）
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 标签不存在
 *       409:
 *         description: 标签名称冲突
 *       500:
 *         description: 服务器错误
 *
 *   delete:
 *     summary: 删除标签
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 标签ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 标签不存在
 *       500:
 *         description: 服务器错误
 */
