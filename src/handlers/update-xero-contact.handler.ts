import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Contact, Phone, Address, Contacts, CurrencyCode } from "xero-node";
import { getClientHeaders } from "../helpers/get-client-headers.js";

async function updateContact(
  name: string,
  firstName: string | undefined,
  lastName: string | undefined,
  email: string | undefined,
  phone: string | undefined,
  address: Address | undefined,
  contactId: string,
  defaultCurrency: string | undefined,
  addressType: string | undefined,
): Promise<Contact | undefined> {
  await xeroClient.authenticate();

  let addresses: Address[] | undefined;
  if (address) {
    const baseAddress = {
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
      region: address.region,
    };

    if (addressType === "POBOX") {
      addresses = [{ ...baseAddress, addressType: Address.AddressTypeEnum.POBOX }];
    } else if (addressType === "STREET") {
      addresses = [{ ...baseAddress, addressType: Address.AddressTypeEnum.STREET }];
    } else {
      // Default: set both POBOX and STREET so the address appears on
      // purchase orders (POBOX) and in the general contact view (STREET).
      addresses = [
        { ...baseAddress, addressType: Address.AddressTypeEnum.POBOX },
        { ...baseAddress, addressType: Address.AddressTypeEnum.STREET },
      ];
    }
  }

  const contact: Contact = {
    name,
    firstName,
    lastName,
    emailAddress: email,
    defaultCurrency: defaultCurrency as CurrencyCode | undefined,
    phones: phone
      ? [
          {
            phoneNumber: phone,
            phoneType: Phone.PhoneTypeEnum.MOBILE,
          },
        ]
      : undefined,
    addresses,
  };

  const contacts: Contacts = {
    contacts: [contact],
  };

  const response = await xeroClient.accountingApi.updateContact(
    xeroClient.tenantId,
    contactId, // contactId
    contacts, // contacts
    undefined, // idempotencyKey
    getClientHeaders(),
  );

  const updatedContact = response.body.contacts?.[0];
  return updatedContact;
}

/**
 * Create a new invoice in Xero
 */
export async function updateXeroContact(
  contactId: string,
  name: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string,
  address?: Address,
  defaultCurrency?: string,
  addressType?: string,
): Promise<XeroClientResponse<Contact>> {
  try {
    const updatedContact = await updateContact(
      name,
      firstName,
      lastName,
      email,
      phone,
      address,
      contactId,
      defaultCurrency,
      addressType,
    );

    if (!updatedContact) {
      throw new Error("Contact update failed.");
    }

    return {
      result: updatedContact,
      isError: false,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
