import { useUsersActions, useUsersState } from '@/features/users'
import { memo } from 'react'

function UsersControler() {
  const { users, targetIds, newUserState, userEditState, userDeleteState } = useUsersState()
  const { onDeleteSelected, newUserDispatch, userEditDispatch, userDeleteDispatch } =
    useUsersActions()

  const isNoUserData = users.length === 0
  const isShowNewUserFormEl =
    !userEditState.isShowAllEditor && !userDeleteState.isShowDeleteCheckbox
  const isShowDeleteCheckboxEl =
    !isNoUserData && !newUserState.isShowEditor && !userEditState.isShowAllEditor
  const isShowAllEditorEl =
    !isNoUserData && !newUserState.isShowEditor && !userDeleteState.isShowDeleteCheckbox
  const resultCount = users.length.toString().padStart(2, '0')
  const isAllChecked = users.length > 0 && userDeleteState.checkedIds.length === users.length

  const handleClickCheckedItemDeleting = async () => {
    if (userDeleteState.checkedIds.length === 0) {
      alert('선택한 데이터가 없습니다.')
      return
    }

    if (userDeleteState.deleteing) return

    const targetUsers = users.filter(({ id }) => userDeleteState.checkedIds.includes(id))
    const targetUsersnames = targetUsers.map((u) => `${u.first_name} ${u.last_name}`).join(', ')

    const confirmMsg = `${targetUsersnames} 유저들을 삭제하시겠습니까?`
    if (!confirm(confirmMsg)) return

    try {
      userDeleteDispatch({ type: 'SUBMIT_CHECKED_ITEMS_START' })
      await onDeleteSelected(userDeleteState.checkedIds)
      userDeleteDispatch({ type: 'SUBMIT_SUCCESS' })
      alert('삭제를 완료하였습니다.')
    } catch (err) {
      console.error(err)
      userDeleteDispatch({
        type: 'SUBMIT_ERROR',
        payload: { msg: '삭제에 실패했습니다. 다시 시도해주세요.' },
      })
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="users__head">
      <span className="users__result">검색 결과 : {resultCount}건</span>

      <div className="users__actions">
        {isShowNewUserFormEl && (
          <>
            {!newUserState.isShowEditor ? (
              <button
                type="button"
                className="line"
                onClick={() => {
                  newUserDispatch({ type: 'SHOW_EDITOR' })
                  userEditDispatch({ type: 'RESET_START_ALL_VALUE' })
                }}
              >
                추가하기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="line"
                  onClick={() => newUserDispatch({ type: 'HIDE_EDITOR' })}
                >
                  추가취소
                </button>
                <button type="submit" form="usersNewForm" disabled={newUserState.isCreating}>
                  {newUserState.isCreating ? '추가중...' : '추가완료'}
                </button>
              </>
            )}
          </>
        )}

        {isShowDeleteCheckboxEl && (
          <>
            {!userDeleteState.isShowDeleteCheckbox ? (
              <button
                type="button"
                className="line"
                onClick={() => {
                  userDeleteDispatch({ type: 'SHOW_CHECKBOX' })
                  userEditDispatch({ type: 'RESET_START_ALL_VALUE' })
                }}
              >
                삭제할 유저 선택하기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="line"
                  onClick={() => userDeleteDispatch({ type: 'HIDE_CHECKBOX' })}
                >
                  선택취소
                </button>
                {isAllChecked ? (
                  <button
                    type="button"
                    className="line"
                    onClick={() => userDeleteDispatch({ type: 'RESET_CHECKED' })}
                  >
                    전체취소
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      userDeleteDispatch({ type: 'ALL_CHECKED', payload: { ids: targetIds } })
                    }
                  >
                    전체선택
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClickCheckedItemDeleting}
                  disabled={userDeleteState.deleteing == 'all'}
                >
                  {userDeleteState.deleteing == 'all' ? '삭제중...' : '삭제하기'}
                </button>
              </>
            )}
          </>
        )}

        {isShowAllEditorEl && (
          <>
            {!userEditState.isShowAllEditor ? (
              <button
                type="button"
                className="line"
                onClick={() => userEditDispatch({ type: 'OPEN_ALL_EDITOR' })}
              >
                전체수정
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="line"
                  onClick={() => userEditDispatch({ type: 'RESET_START_ALL_VALUE' })}
                >
                  수정취소
                </button>
                <button type="submit" form="users" disabled={userEditState.editing === 'all'}>
                  {userEditState.editing === 'all' ? '수정중...' : '수정완료'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default memo(UsersControler)
