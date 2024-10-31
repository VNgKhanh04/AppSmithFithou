import React from "react";
import { useSelector } from "react-redux";

import { useParams } from "react-router-dom";
import { removeSpecialChars } from "utils/helpers";
import type { AppState } from "ee/reducers";
import {
  getJsCollectionByBaseId,
  getPlugin,
} from "ee/selectors/entitiesSelector";
import {
  ACTION_NAME_PLACEHOLDER,
  JSOBJECT_ID_NOT_FOUND_IN_URL,
  createMessage,
} from "ee/constants/messages";
import EditableText, {
  EditInteractionKind,
} from "components/editorComponents/EditableText";
import { Flex } from "@appsmith/ads";
import { getAssetUrl } from "ee/utils/airgapHelpers";
import NameEditorComponent, {
  IconBox,
  IconWrapper,
  NameWrapper,
} from "components/utils/NameEditorComponent";
import { getSavingStatusForJSObjectName } from "selectors/actionSelectors";
import type { ReduxAction } from "ee/constants/ReduxActionConstants";

export interface SaveActionNameParams {
  id: string;
  name: string;
}
export interface JSObjectNameEditorProps {
  /*
    This prop checks if page is API Pane or Query Pane or Curl Pane
    So, that we can toggle between ads editable-text component and existing editable-text component
    Right now, it's optional so that it doesn't impact any other pages other than API Pane.
    In future, when default component will be ads editable-text, then we can remove this prop.
  */
  page?: string;
  disabled?: boolean;
  saveJSObjectName: (
    params: SaveActionNameParams,
  ) => ReduxAction<SaveActionNameParams>;
}

export function JSObjectNameEditor(props: JSObjectNameEditorProps) {
  const params = useParams<{
    baseCollectionId?: string;
    baseQueryId?: string;
  }>();

  const currentJSObjectConfig = useSelector((state: AppState) =>
    getJsCollectionByBaseId(state, params.baseCollectionId || ""),
  );

  const currentPlugin = useSelector((state: AppState) =>
    getPlugin(state, currentJSObjectConfig?.pluginId || ""),
  );

  const saveStatus = useSelector((state) =>
    getSavingStatusForJSObjectName(state, currentJSObjectConfig?.id || ""),
  );

  return (
    <NameEditorComponent
      dispatchAction={props.saveJSObjectName}
      id={currentJSObjectConfig?.id}
      idUndefinedErrorMessage={JSOBJECT_ID_NOT_FOUND_IN_URL}
      name={currentJSObjectConfig?.name}
      saveStatus={saveStatus}
    >
      {({
        forceUpdate,
        handleNameChange,
        isInvalidNameForEntity,
        isNew,
        saveStatus,
      }: {
        forceUpdate: boolean;
        handleNameChange: (value: string) => void;
        isInvalidNameForEntity: (value: string) => string | boolean;
        isNew: boolean;
        saveStatus: { isSaving: boolean; error: boolean };
      }) => (
        <NameWrapper enableFontStyling>
          <Flex
            alignItems="center"
            gap="spaces-3"
            overflow="hidden"
            width="100%"
          >
            {currentPlugin && (
              <IconBox>
                <IconWrapper
                  alt={currentPlugin.name}
                  src={getAssetUrl(currentPlugin.iconLocation)}
                />
              </IconBox>
            )}
            <EditableText
              className="t--js-action-name-edit-field"
              defaultValue={
                currentJSObjectConfig ? currentJSObjectConfig.name : ""
              }
              disabled={props.disabled}
              editInteractionKind={EditInteractionKind.SINGLE}
              errorTooltipClass="t--action-name-edit-error"
              forceDefault={forceUpdate}
              isEditingDefault={isNew}
              isInvalid={isInvalidNameForEntity}
              onTextChanged={handleNameChange}
              placeholder={createMessage(ACTION_NAME_PLACEHOLDER, "JS Object")}
              type="text"
              underline
              updating={saveStatus.isSaving}
              valueTransform={removeSpecialChars}
            />
          </Flex>
        </NameWrapper>
      )}
    </NameEditorComponent>
  );
}

export default JSObjectNameEditor;